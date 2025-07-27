import { Changeset } from 'changesets';
import { EditorView } from "codemirror";
import { LongTextChange, type LongTextAttribute } from "linkedrecords/browser_sdk";
import { StateEffect, Annotation } from '@codemirror/state';
import type { ViewUpdate } from "@codemirror/view";

const programmaticChange = Annotation.define();

function applyChangeset(cs: any, view: EditorView) {
  const ops = cs;
  const changes = [];

  let index = 0;
  let addPtr = 0;
  let remPtr = 0;

  for (const op of ops) {
    const symbol = Object.getPrototypeOf(op).symbol;

    if (symbol === '=') {
      index += op.length;
    } else if (symbol === '-') {
      changes.push({
        from: index,
        to: index + op.length,
        insert: ""
      });
      // Only advance index for deleted text (since the source text is being removed)
      index += op.length;
      remPtr += op.length;
    } else if (symbol === '+') {
      const insText = cs.addendum.slice(addPtr, addPtr + op.length);
      changes.push({
        from: index,
        to: index,
        insert: insText
      });
      // DO NOT advance `index` — this is key!
      addPtr += op.length;
    }
  }

  const transaction = view.state.update({ changes });
  const mappedSelection = view.state.selection.map(transaction.changes);

  view.dispatch({
    changes: transaction.changes,
    selection: mappedSelection,
    scrollIntoView: true,
    annotations: programmaticChange.of(true)
  });
}

function updateToChangeset(update: ViewUpdate) {
  const cs = Changeset.create();

  const oldDoc = update.startState.doc.toString();
  const newDoc = update.state.doc.toString();

  // Keep track of where we are in old and new doc
  let oldPos = 0;

  // The changeset changes come from update.changes.iterChanges
  update.changes.iterChanges((fromA, toA, fromB, toB) => {
    // Retain text before this change
    if (fromA > oldPos) {
      cs.retain(fromA - oldPos);
      oldPos = fromA;
    }

    // Delete old text if any
    if (toA > fromA) {
      const delText = oldDoc.slice(fromA, toA);
      cs.delete(delText);
      oldPos = toA;
    }

    // Insert new text if any
    if (toB > fromB) {
      const insText = newDoc.slice(fromB, toB);
      cs.insert(insText);
    }
  });

  // Retain any remaining text at the end of the document
  if (oldPos < oldDoc.length) {
    cs.retain(oldDoc.length - oldPos);
  }

  return cs.end();
}

export default function bind(view: EditorView, lrAttribute: LongTextAttribute) {
  const updateListener = EditorView.updateListener.of((update) => {
    const isProgrammatic = update.transactions.some(tr =>
      tr.annotation(programmaticChange) === true
    );

    if (update.docChanged && !isProgrammatic) {
      const cs = updateToChangeset(update);
      lrAttribute.change(new LongTextChange(cs));
    }
  });

  view.dispatch({
    effects: StateEffect.appendConfig.of([
      updateListener
    ])
  });

  lrAttribute.subscribe(async (change: any, changeInfo: any) => {
    if(!changeInfo) {
      return;
    }

    applyChangeset(change.changeset, view);
  });
}