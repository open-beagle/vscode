/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/strings", "vs/nls!vs/workbench/contrib/welcome/page/browser/vs_code_welcome_page"], function (require, exports, strings_1, nls_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = () => `
<div class="welcomePageContainer">
	<div class="welcomePage" role="document">
		<div class="title">
			<h1 class="caption">${(0, strings_1.escape)((0, nls_1.localize)(0, null))}</h1>
		</div>
		<div class="row">
			<div class="splash">
				<div class="section start">
					<h2 class="caption">${(0, strings_1.escape)((0, nls_1.localize)(1, null))}</h2>
					<ul>
						<li><a href="command:workbench.action.files.newUntitledFile">${(0, strings_1.escape)((0, nls_1.localize)(2, null))}</a></li>
						<li class="mac-only"><a href="command:workbench.action.files.openFolder">${(0, strings_1.escape)((0, nls_1.localize)(3, null))}</a> or <a href="command:git.clone">${(0, strings_1.escape)((0, nls_1.localize)(4, null))}</a></li>
						<li class="windows-only linux-only"><a href="command:workbench.action.files.openFolder">${(0, strings_1.escape)((0, nls_1.localize)(5, null))}</a> or <a href="command:git.clone">${(0, strings_1.escape)((0, nls_1.localize)(6, null))}</a></li>
					</ul>
				</div>
				<div class="section recent">
					<h2 class="caption">${(0, strings_1.escape)((0, nls_1.localize)(7, null))}</h2>
					<ul class="list">
						<!-- Filled programmatically -->
						<li class="moreRecent"><a href="command:workbench.action.openRecent">${(0, strings_1.escape)((0, nls_1.localize)(8, null))}</a><span class="path detail if_shortcut" data-command="workbench.action.openRecent">(<span class="shortcut" data-command="workbench.action.openRecent"></span>)</span></li>
					</ul>
					<p class="none detail">${(0, strings_1.escape)((0, nls_1.localize)(9, null))}</p>
				</div>
				<div class="section help">
					<h2 class="caption">${(0, strings_1.escape)((0, nls_1.localize)(10, null))}</h2>
					<ul>
						<li class="keybindingsReferenceLink"><a href="command:workbench.action.keybindingsReference">${(0, strings_1.escape)((0, nls_1.localize)(11, null))}</a></li>
						<li><a href="command:workbench.action.openIntroductoryVideosUrl">${(0, strings_1.escape)((0, nls_1.localize)(12, null))}</a></li>
						<li><a href="command:workbench.action.openTipsAndTricksUrl">${(0, strings_1.escape)((0, nls_1.localize)(13, null))}</a></li>
						<li><a href="command:workbench.action.openDocumentationUrl">${(0, strings_1.escape)((0, nls_1.localize)(14, null))}</a></li>
						<li><a href="https://github.com/microsoft/vscode">${(0, strings_1.escape)((0, nls_1.localize)(15, null))}</a></li>
						<li><a href="https://stackoverflow.com/questions/tagged/vscode?sort=votes&pageSize=50">${(0, strings_1.escape)((0, nls_1.localize)(16, null))}</a></li>
						<li><a href="command:workbench.action.openNewsletterSignupUrl">${(0, strings_1.escape)((0, nls_1.localize)(17, null))}</a></li>
					</ul>
				</div>
				<p class="showOnStartup"><input type="checkbox" id="showOnStartup" class="checkbox"> <label class="caption" for="showOnStartup">${(0, strings_1.escape)((0, nls_1.localize)(18, null))}</label></p>
			</div>
			<div class="commands">
				<div class="section customize">
					<h2 class="caption">${(0, strings_1.escape)((0, nls_1.localize)(19, null))}</h2>
					<div class="list">
						<div class="item showLanguageExtensions"><button data-href="command:workbench.extensions.action.showLanguageExtensions"><h3 class="caption">${(0, strings_1.escape)((0, nls_1.localize)(20, null))}</h3> <span class="detail">${(0, strings_1.escape)((0, nls_1.localize)(21, null))
        .replace('{0}', `<span class="extensionPackList"></span>`)
        .replace('{1}', `<a href="command:workbench.extensions.action.showLanguageExtensions" title="${(0, nls_1.localize)(22, null)}">${(0, strings_1.escape)((0, nls_1.localize)(23, null))}</a>`)}
						</span></button></div>
						<div class="item showRecommendedKeymapExtensions"><button data-href="command:workbench.extensions.action.showRecommendedKeymapExtensions"><h3 class="caption">${(0, strings_1.escape)((0, nls_1.localize)(24, null))}</h3> <span class="detail">${(0, strings_1.escape)((0, nls_1.localize)(25, null))
        .replace('{0}', `<span class="keymapList"></span>`)
        .replace('{1}', `<a href="command:workbench.extensions.action.showRecommendedKeymapExtensions" title="${(0, nls_1.localize)(26, null)}">${(0, strings_1.escape)((0, nls_1.localize)(27, null))}</a>`)}
						</span></button></div>
						<div class="item selectTheme"><button data-href="command:workbench.action.selectTheme"><h3 class="caption">${(0, strings_1.escape)((0, nls_1.localize)(28, null))}</h3> <span class="detail">${(0, strings_1.escape)((0, nls_1.localize)(29, null))}</span></button></div>
					</div>
				</div>
				<div class="section learn">
					<h2 class="caption">${(0, strings_1.escape)((0, nls_1.localize)(30, null))}</h2>
					<div class="list">
						<div class="item showCommands"><button data-href="command:workbench.action.showCommands"><h3 class="caption">${(0, strings_1.escape)((0, nls_1.localize)(31, null))}</h3> <span class="detail">${(0, strings_1.escape)((0, nls_1.localize)(32, null)).replace('{0}', '<span class="shortcut" data-command="workbench.action.showCommands"></span>')}</span></button></div>
						<div class="item showInterfaceOverview"><button data-href="command:workbench.action.showInterfaceOverview"><h3 class="caption">${(0, strings_1.escape)((0, nls_1.localize)(33, null))}</h3> <span class="detail">${(0, strings_1.escape)((0, nls_1.localize)(34, null))}</span></button></div>
						<div class="item showInteractivePlayground"><button data-href="command:workbench.action.showInteractivePlayground"><h3 class="caption">${(0, strings_1.escape)((0, nls_1.localize)(35, null))}</h3> <span class="detail">${(0, strings_1.escape)((0, nls_1.localize)(36, null))}</span></button></div>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
`;
});
//# sourceMappingURL=vs_code_welcome_page.js.map