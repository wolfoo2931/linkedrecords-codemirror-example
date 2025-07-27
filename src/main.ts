import './style.css'

import { basicSetup } from "codemirror"
import { EditorView } from "@codemirror/view"
import { EditorState } from "@codemirror/state";
import linkedRecords from './lr_client';
import type { LongTextAttribute } from 'linkedrecords/browser_sdk';

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

const setupTermsProm = linkedRecords.Fact.createAll([
  ['CMDoc', '$isATermFor', 'a document'],
]);

async function findOrCreateDocument() {
  const { docs } = await linkedRecords.Attribute.findAll({
    docs: [
      ['isA', 'CMDoc'],
    ],
  });

  return docs.length
    ? docs[0]
    : await linkedRecords.Attribute.createLongText('the content', [['isA', 'CMDoc']]);
}

async function initDoc() {
  const doc = await findOrCreateDocument();

  const updateListener = EditorView.updateListener.of((update) => {
    if (update.docChanged) {
      doc.set(update.state.doc.toString());
    }
  });

  const state = EditorState.create({
    doc: await doc.getValue(),
    extensions: [ basicSetup, updateListener ]
  });

  const view = new EditorView({
    state,
    parent: document.body,
    extensions: [ basicSetup ]
  });

  doc.subscribe(async (change: any) => {
    if (view.state.doc.toString() !== await doc.getValue()) {
      applyChangeset(change.changeset, view);
    }
  });
}

setupTermsProm.then(initDoc);