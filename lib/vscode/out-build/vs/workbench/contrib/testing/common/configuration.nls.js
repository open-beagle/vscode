/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
define([], [
	"Testing",
	"Controls which tests are automatically run.",
	"Automatically runs all discovered test when auto-run is toggled. Reruns individual tests when they are changed.",
	"Reruns individual tests when they are changed. Will not automatically run any tests that have not been already executed.",
	"How long to wait, in milliseconds, after a test is marked as outdated and starting a new run.",
	"Configures when the error peek view is automatically opened.",
	"Open automatically no matter where the failure is.",
	"Open automatically when a test fails in a visible document.",
	"Controls whether to automatically open the peek view during auto-run mode.",
	'Controls whether the running test should be followed in the test explorer view'
]);