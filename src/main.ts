import './style.css'

import { basicSetup } from "codemirror";
import { EditorView } from "@codemirror/view";
import { EditorState } from "@codemirror/state";
import LinkedRecords, { LongTextAttribute } from 'linkedrecords/browser_sdk';
import bind from './bindCM2LR';

const lr = LinkedRecords.getPublicClient('https://us1.api.linkedrecords.com');

async function findOrCreateDocument(): Promise<LongTextAttribute> {
  const { docs } = await lr.Attribute.findAll({
    docs: [
      ['$hasDataType', LongTextAttribute],
      ['isA', 'PlainTextFile'],
    ],
  });

  return docs.length
    ? docs[0]
    : lr.Attribute.createLongText('the content', [['isA', 'PlainTextFile']]);
}

async function initEditor(doc: LongTextAttribute) {
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

lr.isAuthenticated().then(async (isAuthenticated) => {
  console.log('isAuthenticated', isAuthenticated)

  if (!isAuthenticated) {
    await lr.login();
  }

  await lr.Fact.createAll([
    ['PlainTextFile', '$isATermFor', 'a string which contains plain text (Markdown)'],
  ]);

  const doc = await findOrCreateDocument();
  await initEditor(doc);
});