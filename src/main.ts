import './style.css'

import { basicSetup } from "codemirror";
import { EditorView } from "@codemirror/view";
import { EditorState } from "@codemirror/state";
import linkedRecords from './lr_client';
import { LongTextAttribute } from 'linkedrecords/browser_sdk';
import bind from './bindCM2LR';

const setupTermsProm = linkedRecords.Fact.createAll([
  ['PlainTextFile', '$isATermFor', 'a document'],
]);

async function findOrCreateDocument(): Promise<LongTextAttribute> {
  const { docs } = await linkedRecords.Attribute.findAll({
    docs: [
      ['$hasDataType', LongTextAttribute],
      ['isA', 'PlainTextFile'],
    ],
  });

  return docs.length
    ? docs[0]
    : await linkedRecords.Attribute.createLongText('the content', [['isA', 'PlainTextFile']]);
}

async function initEditor() {
  const doc = await findOrCreateDocument();
  const state = EditorState.create({
    doc: await doc.getValue(),
    extensions: [ basicSetup ]
  });

  const view = new EditorView({
    state,
    parent: document.body,
    extensions: [ basicSetup ],
  });

  bind(view, doc);
}

setupTermsProm.then(initEditor);