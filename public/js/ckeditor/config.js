/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or http://ckeditor.com/license
 */

CKEDITOR.editorConfig = function( config ) {
	// Define changes to default configuration here. For example:
  config.extraPlugins = 'responsivness';
};

CKEDITOR.on('dialogDefinition', function( ev ) {

	  var diagName = ev.data.name;
	  var diagDefn = ev.data.definition;

	  if(diagName === 'table') {
	    var infoTab = diagDefn.getContents('info');

	    var width = infoTab.get('txtWidth');
	    width['default'] = "100%";

	    
	  }
});
