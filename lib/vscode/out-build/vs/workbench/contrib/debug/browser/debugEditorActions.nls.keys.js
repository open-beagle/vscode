/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
define([], [
	'toggleBreakpointAction',
	{ key: 'miToggleBreakpoint', comment: ['&& denotes a mnemonic'] },
	'conditionalBreakpointEditorAction',
	{ key: 'miConditionalBreakpoint', comment: ['&& denotes a mnemonic'] },
	'logPointEditorAction',
	{ key: 'miLogPoint', comment: ['&& denotes a mnemonic'] },
	'runToCursor',
	'evaluateInDebugConsole',
	'addToWatch',
	'showDebugHover',
	{ key: 'stepIntoTargets', comment: ['Step Into Targets lets the user step into an exact function he or she is interested in.'] },
	'goToNextBreakpoint',
	'goToPreviousBreakpoint',
	'closeExceptionWidget'
]);