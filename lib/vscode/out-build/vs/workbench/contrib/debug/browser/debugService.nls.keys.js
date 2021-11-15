/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
define([], [
	'1activeSession',
	'nActiveSessions',
	'runTrust',
	'debugTrust',
	{ key: 'compoundMustHaveConfigurations', comment: ['compound indicates a "compounds" configuration item', '"configurations" is an attribute and should not be localized'] },
	'noConfigurationNameInWorkspace',
	'multipleConfigurationNamesInWorkspace',
	'noFolderWithName',
	'configMissing',
	'launchJsonDoesNotExist',
	'debugRequestNotSupported',
	'debugRequesMissing',
	'debugTypeNotSupported',
	'debugTypeMissing',
	{ key: 'installAdditionalDebuggers', comment: ['Placeholder is the debug type, so for example "node", "python"'] },
	'noFolderWorkspaceDebugError',
	'debugAdapterCrash',
	'cancel',
	{ key: 'debuggingPaused', comment: ['First placeholder is the stack frame name, second is the line number, third placeholder is the reason why debugging is stopped, for example "breakpoint" and the last one is the file line content.'] },
	'breakpointAdded',
	'breakpointRemoved'
]);