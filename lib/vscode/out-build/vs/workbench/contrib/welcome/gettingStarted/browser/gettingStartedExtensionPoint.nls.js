/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
define([], [
	"Contribute collections of steps to help users with your extension. Experimental, available in VS Code Insiders only.",
	"Unique identifier for this walkthrough.",
	"Title of walkthrough.",
	"Description of walkthrough.",
	"if this is a `primary` walkthrough, hinting if it should be opened on install of the extension. The first `primary` walkthough with a `when` condition matching the current context may be opened by core on install of the extension.",
	"Context key expression to control the visibility of this walkthrough.",
	"Deprecated. Use `steps` instead",
	"Steps to complete as part of this walkthrough.",
	"Unique identifier for this step. This is used to keep track of which steps have been completed.",
	"Title of step.",
	"Description of step. Supports ``preformatted``, __italic__, and **bold** text. Use markdown-style links for commands or external links: [Title](command:myext.command), [Title](command:toSide:myext.command), or [Title](https://aka.ms). Links on their own line will be rendered as buttons.",
	"Deprecated. Use markdown links in the description instead, i.e. [Title](command:myext.command), [Title](command:toSide:myext.command), or [Title](https://aka.ms), ",
	"Media to show alongside this step, either an image or markdown content.",
	"Path to an image - or object consisting of paths to light, dark, and hc images - relative to extension directory. Depending on context, the image will be displayed from 400px to 800px wide, with similar bounds on height. To support HIDPI displays, the image will be rendered at 1.5x scaling, for example a 900 physical pixels wide image will be displayed as 600 logical pixels wide.",
	"Path to the image for dark themes, relative to extension directory.",
	"Path to the image for light themes, relative to extension directory.",
	"Path to the image for hc themes, relative to extension directory.",
	"Alternate text to display when the image cannot be loaded or in screen readers.",
	"Path to the markdown document, relative to extension directory.",
	"Signal to mark step as complete.",
	"Mark step done when the specified command is executed.",
	"Context key expression to control the visibility of this step.",
	"Contribute commands to help users start using your extension. Experimental, available in VS Code Insiders only.",
	"Title of start item.",
	"Command to run.",
	"Description of start item.",
	"Context key expression to control the visibility of this start item.",
	"The type of start item this is, used for grouping. Supported values are `sample-notebook` or `template-folder`."
]);