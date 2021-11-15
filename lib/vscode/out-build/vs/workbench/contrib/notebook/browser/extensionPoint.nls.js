/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
define([], [
	'Contributes notebook document provider.',
	'Unique identifier of the notebook.',
	'Human readable name of the notebook.',
	'Set of globs that the notebook is for.',
	'Glob that the notebook is enabled for.',
	'Glob that the notebook is disabled for.',
	'Controls if the custom editor is enabled automatically when the user opens a file. This may be overridden by users using the `workbench.editorAssociations` setting.',
	'The editor is automatically used when the user opens a resource, provided that no other default custom editors are registered for that resource.',
	'The editor is not automatically used when the user opens a resource, but a user can switch to the editor using the `Reopen With` command.',
	'Contributes notebook output renderer provider.',
	'Unique identifier of the notebook output renderer.',
	'Rename `viewType` to `id`.',
	'Unique identifier of the notebook output renderer.',
	'Human readable name of the notebook output renderer.',
	'Set of globs that the notebook is for.',
	'File to load in the webview to render the extension.',
	'List of kernel dependencies the renderer requires. If any of the dependencies are present in the `NotebookKernel.preloads`, the renderer can be used.',
	'List of soft kernel dependencies the renderer can make use of. If any of the dependencies are present in the `NotebookKernel.preloads`, the renderer will be preferred over renderers that don\'t interact with the kernel.',
	'Contributes a renderer for markdown cells in notebooks.',
	'Unique identifier of the notebook markdown renderer.',
	'Human readable name of the notebook markdown renderer.',
	'File to load in the webview to render the extension.',
	'The mime type that the renderer handles.',
	'If specified, this renderer augments another renderer instead of providing full rendering.'
]);