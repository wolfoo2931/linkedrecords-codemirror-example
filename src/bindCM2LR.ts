import { EditorView } from "codemirror";
import type { LongTextAttribute } from "linkedrecords/browser_sdk";
import { StateEffect } from '@codemirror/state';

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
      index += op.length;
      remPtr += op.length;
    } else if (symbol === '+') {
      const insText = cs.addendum.slice(addPtr, addPtr + op.length);
      changes.push({
        from: index,
        to: index,
        insert: insText
      });
      index += op.length;
      addPtr += op.length;
    }
  }

  const transaction = view.state.update({ changes });
  const mappedSelection = view.state.selection.map(transaction.changes);

  view.dispatch({
    changes: transaction.changes,
    selection: mappedSelection,
    scrollIntoView: true
  });
}

export default function bind(view: EditorView, lrAttribute: LongTextAttribute) {
  const updateListener = EditorView.updateListener.of((update) => {
    if (update.docChanged) {
      lrAttribute.set(update.state.doc.toString()); // TODO: dispatch a diff here as well
    }
  });

  view.dispatch({
    effects: StateEffect.appendConfig.of([
      updateListener
    ])
  });

  lrAttribute.subscribe(async (change: any) => {
    if (view.state.doc.toString() !== await lrAttribute.getValue()) {
      applyChangeset(change.changeset, view);
    }
  });
}