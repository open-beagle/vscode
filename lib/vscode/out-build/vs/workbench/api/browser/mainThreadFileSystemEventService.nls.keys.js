/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
define([], [
	'ask.1.create',
	'ask.1.copy',
	'ask.1.move',
	'ask.1.delete',
	{ key: 'ask.N.create', comment: ['{0} is a number, e.g "3 extensions want..."'] },
	{ key: 'ask.N.copy', comment: ['{0} is a number, e.g "3 extensions want..."'] },
	{ key: 'ask.N.move', comment: ['{0} is a number, e.g "3 extensions want..."'] },
	{ key: 'ask.N.delete', comment: ['{0} is a number, e.g "3 extensions want..."'] },
	'preview',
	'cancel',
	'ok',
	'preview',
	'cancel',
	'again',
	'msg-create',
	'msg-rename',
	'msg-copy',
	'msg-delete',
	'label',
	'files.participants.timeout'
]);