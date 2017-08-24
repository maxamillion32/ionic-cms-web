import { Component, AfterViewInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AngularFireDatabase, FirebaseListObservable, FirebaseObjectObservable } from 'angularfire2/database';

import * as Quill from 'quill';

import { GuiService } from './gui.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements AfterViewInit {
  documentRoot: any = { title: 'Loading...', items: [] };
  objectObservable: FirebaseObjectObservable<any>;
  documentsObservable: FirebaseListObservable<any>;
  state: any = {
    uploadButtonDisabled: true,
    pageDisabled: true,
    storeButtonDisabled: true
  };
  private pageEditor: Quill;
  emptyArray = [];

  /**
   * @todo Add error handling to `.once` call.
   * @param db 
   * @param guiService 
   */
  constructor(private db: AngularFireDatabase, private guiService: GuiService) {
    this.objectObservable = db.object('/pharm_test_3/documents');
    this.objectObservable.$ref.once('value', snapshot => {
      if (snapshot.val())
        this.documentRoot = snapshot.val();
      else
        this.documentRoot = { title: 'New', items: [] };
    });

    guiService.setState(this.state);
  }

  ngAfterViewInit() {
    // ql-toolbar, ql-container

    let defaultModules = {
      toolbar: [
        ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
        ['blockquote', 'code-block'],

        [{ 'header': 1 }, { 'header': 2 }],               // custom button values
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        [{ 'script': 'sub'}, { 'script': 'super' }],      // superscript/subscript
        [{ 'indent': '-1'}, { 'indent': '+1' }],          // outdent/indent
        [{ 'direction': 'rtl' }],                         // text direction

        [{ 'size': ['small', false, 'large', 'huge'] }],  // custom dropdown
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],

        [{ 'color': this.emptyArray.slice() }, { 'background': this.emptyArray.slice() }],          // dropdown with defaults from theme
        [{ 'font': this.emptyArray.slice() }],
        [{ 'align': this.emptyArray.slice() }],

        ['clean'],                                         // remove formatting button

        ['link', 'image', 'video']                         // link and image, video
      ]
    };
    this.pageEditor = new Quill('#quillPageEditor', { theme: 'snow' });
    this.guiService.setEditor(this.pageEditor);
    this.pageEditor.on('text-change', () => {
      this.state.storeButtonDisabled = false;
      this.state.uploadButtonDisabled = true;

      document.getElementById('quillHTML').innerHTML = document.querySelector('#quillPageEditor .ql-editor').innerHTML;
    });
  }

  upload() {
    this.objectObservable.set(this.documentRoot);
    this.state.uploadButtonDisabled = true;
  }

  logDocument() {
    console.log(this.documentRoot);
  }
}
