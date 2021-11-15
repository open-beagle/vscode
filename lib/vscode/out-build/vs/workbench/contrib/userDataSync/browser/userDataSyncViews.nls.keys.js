/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
define([], [
	'merges',
	'synced machines',
	'workbench.actions.sync.editMachineName',
	'workbench.actions.sync.turnOffSyncOnMachine',
	'remote sync activity title',
	'local sync activity title',
	'workbench.actions.sync.resolveResourceRef',
	'workbench.actions.sync.replaceCurrent',
	{ key: 'confirm replace', comment: ['A confirmation message to replace current user data (settings, extensions, keybindings, snippets) with selected version'] },
	'reset',
	{ key: 'leftResourceName', comment: ['remote as in file in cloud'] },
	{ key: 'rightResourceName', comment: ['local as in file in disk'] },
	'sideBySideLabels',
	{ key: 'current', comment: ['Represents current machine'] },
	'no machines',
	{ key: 'current', comment: ['Current machine'] },
	'not found',
	'turn off sync on machine',
	{ key: 'turn off', comment: ['&& denotes a mnemonic'] },
	'placeholder',
	'not found',
	'valid message'
]);