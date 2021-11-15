/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/comparers", "assert"], function (require, exports, comparers_1, assert) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const compareLocale = (a, b) => a.localeCompare(b);
    const compareLocaleNumeric = (a, b) => a.localeCompare(b, undefined, { numeric: true });
    suite('Comparers', () => {
        test('compareFileNames', () => {
            //
            // Comparisons with the same results as compareFileNamesDefault
            //
            // name-only comparisons
            assert((0, comparers_1.compareFileNames)(null, null) === 0, 'null should be equal');
            assert((0, comparers_1.compareFileNames)(null, 'abc') < 0, 'null should be come before real values');
            assert((0, comparers_1.compareFileNames)('', '') === 0, 'empty should be equal');
            assert((0, comparers_1.compareFileNames)('abc', 'abc') === 0, 'equal names should be equal');
            assert((0, comparers_1.compareFileNames)('z', 'A') > 0, 'z comes is after A regardless of case');
            assert((0, comparers_1.compareFileNames)('Z', 'a') > 0, 'Z comes after a regardless of case');
            // name plus extension comparisons
            assert((0, comparers_1.compareFileNames)('bbb.aaa', 'aaa.bbb') > 0, 'files with extensions are compared first by filename');
            assert((0, comparers_1.compareFileNames)('aggregate.go', 'aggregate_repo.go') > 0, 'compares the whole name all at once by locale');
            // dotfile comparisons
            assert((0, comparers_1.compareFileNames)('.abc', '.abc') === 0, 'equal dotfile names should be equal');
            assert((0, comparers_1.compareFileNames)('.env.', '.gitattributes') < 0, 'filenames starting with dots and with extensions should still sort properly');
            assert((0, comparers_1.compareFileNames)('.env', '.aaa.env') > 0, 'dotfiles sort alphabetically when they contain multiple dots');
            assert((0, comparers_1.compareFileNames)('.env', '.env.aaa') < 0, 'dotfiles with the same root sort shortest first');
            assert((0, comparers_1.compareFileNames)('.aaa_env', '.aaa.env') < 0, 'and underscore in a dotfile name will sort before a dot');
            // dotfile vs non-dotfile comparisons
            assert((0, comparers_1.compareFileNames)(null, '.abc') < 0, 'null should come before dotfiles');
            assert((0, comparers_1.compareFileNames)('.env', 'aaa') < 0, 'dotfiles come before filenames without extensions');
            assert((0, comparers_1.compareFileNames)('.env', 'aaa.env') < 0, 'dotfiles come before filenames with extensions');
            assert((0, comparers_1.compareFileNames)('.md', 'A.MD') < 0, 'dotfiles sort before uppercase files');
            assert((0, comparers_1.compareFileNames)('.MD', 'a.md') < 0, 'dotfiles sort before lowercase files');
            // numeric comparisons
            assert((0, comparers_1.compareFileNames)('1', '1') === 0, 'numerically equal full names should be equal');
            assert((0, comparers_1.compareFileNames)('abc1.txt', 'abc1.txt') === 0, 'equal filenames with numbers should be equal');
            assert((0, comparers_1.compareFileNames)('abc1.txt', 'abc2.txt') < 0, 'filenames with numbers should be in numerical order, not alphabetical order');
            assert((0, comparers_1.compareFileNames)('abc2.txt', 'abc10.txt') < 0, 'filenames with numbers should be in numerical order even when they are multiple digits long');
            assert((0, comparers_1.compareFileNames)('abc02.txt', 'abc010.txt') < 0, 'filenames with numbers that have leading zeros sort numerically');
            assert((0, comparers_1.compareFileNames)('abc1.10.txt', 'abc1.2.txt') > 0, 'numbers with dots between them are treated as two separate numbers, not one decimal number');
            //
            // Comparisons with different results than compareFileNamesDefault
            //
            // name-only comparisons
            assert((0, comparers_1.compareFileNames)('a', 'A') !== compareLocale('a', 'A'), 'the same letter does not sort by locale');
            assert((0, comparers_1.compareFileNames)('â', 'Â') !== compareLocale('â', 'Â'), 'the same accented letter does not sort by locale');
            assert.notDeepStrictEqual(['artichoke', 'Artichoke', 'art', 'Art'].sort(comparers_1.compareFileNames), ['artichoke', 'Artichoke', 'art', 'Art'].sort(compareLocale), 'words with the same root and different cases do not sort in locale order');
            assert.notDeepStrictEqual(['email', 'Email', 'émail', 'Émail'].sort(comparers_1.compareFileNames), ['email', 'Email', 'émail', 'Émail'].sort(compareLocale), 'the same base characters with different case or accents do not sort in locale order');
            // numeric comparisons
            assert((0, comparers_1.compareFileNames)('abc02.txt', 'abc002.txt') > 0, 'filenames with equivalent numbers and leading zeros sort in unicode order');
            assert((0, comparers_1.compareFileNames)('abc.txt1', 'abc.txt01') > 0, 'same name plus extensions with equal numbers sort in unicode order');
            assert((0, comparers_1.compareFileNames)('art01', 'Art01') !== 'art01'.localeCompare('Art01', undefined, { numeric: true }), 'a numerically equivalent word of a different case does not compare numerically based on locale');
        });
        test('compareFileExtensions', () => {
            //
            // Comparisons with the same results as compareFileExtensionsDefault
            //
            // name-only comparisons
            assert((0, comparers_1.compareFileExtensions)(null, null) === 0, 'null should be equal');
            assert((0, comparers_1.compareFileExtensions)(null, 'abc') < 0, 'null should come before real files without extension');
            assert((0, comparers_1.compareFileExtensions)('', '') === 0, 'empty should be equal');
            assert((0, comparers_1.compareFileExtensions)('abc', 'abc') === 0, 'equal names should be equal');
            assert((0, comparers_1.compareFileExtensions)('z', 'A') > 0, 'z comes after A');
            assert((0, comparers_1.compareFileExtensions)('Z', 'a') > 0, 'Z comes after a');
            // name plus extension comparisons
            assert((0, comparers_1.compareFileExtensions)('file.ext', 'file.ext') === 0, 'equal full names should be equal');
            assert((0, comparers_1.compareFileExtensions)('a.ext', 'b.ext') < 0, 'if equal extensions, filenames should be compared');
            assert((0, comparers_1.compareFileExtensions)('file.aaa', 'file.bbb') < 0, 'files with equal names should be compared by extensions');
            assert((0, comparers_1.compareFileExtensions)('bbb.aaa', 'aaa.bbb') < 0, 'files should be compared by extensions even if filenames compare differently');
            assert((0, comparers_1.compareFileExtensions)('agg.go', 'aggrepo.go') < 0, 'shorter names sort before longer names');
            assert((0, comparers_1.compareFileExtensions)('agg.go', 'agg_repo.go') < 0, 'shorter names short before longer names even when the longer name contains an underscore');
            assert((0, comparers_1.compareFileExtensions)('a.MD', 'b.md') < 0, 'when extensions are the same except for case, the files sort by name');
            // dotfile comparisons
            assert((0, comparers_1.compareFileExtensions)('.abc', '.abc') === 0, 'equal dotfiles should be equal');
            assert((0, comparers_1.compareFileExtensions)('.md', '.Gitattributes') > 0, 'dotfiles sort alphabetically regardless of case');
            // dotfile vs non-dotfile comparisons
            assert((0, comparers_1.compareFileExtensions)(null, '.abc') < 0, 'null should come before dotfiles');
            assert((0, comparers_1.compareFileExtensions)('.env', 'aaa.env') < 0, 'if equal extensions, filenames should be compared, empty filename should come before others');
            assert((0, comparers_1.compareFileExtensions)('.MD', 'a.md') < 0, 'if extensions differ in case, files sort by extension in unicode order');
            // numeric comparisons
            assert((0, comparers_1.compareFileExtensions)('1', '1') === 0, 'numerically equal full names should be equal');
            assert((0, comparers_1.compareFileExtensions)('abc1.txt', 'abc1.txt') === 0, 'equal filenames with numbers should be equal');
            assert((0, comparers_1.compareFileExtensions)('abc1.txt', 'abc2.txt') < 0, 'filenames with numbers should be in numerical order, not alphabetical order');
            assert((0, comparers_1.compareFileExtensions)('abc2.txt', 'abc10.txt') < 0, 'filenames with numbers should be in numerical order even when they are multiple digits long');
            assert((0, comparers_1.compareFileExtensions)('abc02.txt', 'abc010.txt') < 0, 'filenames with numbers that have leading zeros sort numerically');
            assert((0, comparers_1.compareFileExtensions)('abc1.10.txt', 'abc1.2.txt') > 0, 'numbers with dots between them are treated as two separate numbers, not one decimal number');
            assert((0, comparers_1.compareFileExtensions)('abc2.txt2', 'abc1.txt10') < 0, 'extensions with numbers should be in numerical order, not alphabetical order');
            assert((0, comparers_1.compareFileExtensions)('txt.abc1', 'txt.abc1') === 0, 'equal extensions with numbers should be equal');
            assert((0, comparers_1.compareFileExtensions)('txt.abc1', 'txt.abc2') < 0, 'extensions with numbers should be in numerical order, not alphabetical order');
            assert((0, comparers_1.compareFileExtensions)('txt.abc2', 'txt.abc10') < 0, 'extensions with numbers should be in numerical order even when they are multiple digits long');
            assert((0, comparers_1.compareFileExtensions)('a.ext1', 'b.ext1') < 0, 'if equal extensions with numbers, filenames should be compared');
            assert((0, comparers_1.compareFileExtensions)('a10.txt', 'A2.txt') > 0, 'filenames with number and case differences compare numerically');
            //
            // Comparisons with different results from compareFileExtensionsDefault
            //
            // name-only comparisions
            assert((0, comparers_1.compareFileExtensions)('a', 'A') !== compareLocale('a', 'A'), 'the same letter of different case does not sort by locale');
            assert((0, comparers_1.compareFileExtensions)('â', 'Â') !== compareLocale('â', 'Â'), 'the same accented letter of different case does not sort by locale');
            assert.notDeepStrictEqual(['artichoke', 'Artichoke', 'art', 'Art'].sort(comparers_1.compareFileExtensions), ['artichoke', 'Artichoke', 'art', 'Art'].sort(compareLocale), 'words with the same root and different cases do not sort in locale order');
            assert.notDeepStrictEqual(['email', 'Email', 'émail', 'Émail'].sort(comparers_1.compareFileExtensions), ['email', 'Email', 'émail', 'Émail'].sort((a, b) => a.localeCompare(b)), 'the same base characters with different case or accents do not sort in locale order');
            // name plus extension comparisons
            assert((0, comparers_1.compareFileExtensions)('a.MD', 'a.md') !== compareLocale('MD', 'md'), 'case differences in extensions do not sort by locale');
            assert((0, comparers_1.compareFileExtensions)('a.md', 'A.md') !== compareLocale('a', 'A'), 'case differences in names do not sort by locale');
            assert((0, comparers_1.compareFileExtensions)('aggregate.go', 'aggregate_repo.go') < 0, 'when extensions are equal, names sort in dictionary order');
            // dotfile comparisons
            assert((0, comparers_1.compareFileExtensions)('.env', '.aaa.env') < 0, 'a dotfile with an extension is treated as a name plus an extension - equal extensions');
            assert((0, comparers_1.compareFileExtensions)('.env', '.env.aaa') > 0, 'a dotfile with an extension is treated as a name plus an extension - unequal extensions');
            // dotfile vs non-dotfile comparisons
            assert((0, comparers_1.compareFileExtensions)('.env', 'aaa') > 0, 'filenames without extensions come before dotfiles');
            assert((0, comparers_1.compareFileExtensions)('.md', 'A.MD') > 0, 'a file with an uppercase extension sorts before a dotfile of the same lowercase extension');
            // numeric comparisons
            assert((0, comparers_1.compareFileExtensions)('abc.txt01', 'abc.txt1') < 0, 'extensions with equal numbers sort in unicode order');
            assert((0, comparers_1.compareFileExtensions)('art01', 'Art01') !== compareLocaleNumeric('art01', 'Art01'), 'a numerically equivalent word of a different case does not compare by locale');
            assert((0, comparers_1.compareFileExtensions)('abc02.txt', 'abc002.txt') > 0, 'filenames with equivalent numbers and leading zeros sort in unicode order');
            assert((0, comparers_1.compareFileExtensions)('txt.abc01', 'txt.abc1') < 0, 'extensions with equivalent numbers sort in unicode order');
        });
        test('compareFileNamesDefault', () => {
            //
            // Comparisons with the same results as compareFileNames
            //
            // name-only comparisons
            assert((0, comparers_1.compareFileNamesDefault)(null, null) === 0, 'null should be equal');
            assert((0, comparers_1.compareFileNamesDefault)(null, 'abc') < 0, 'null should be come before real values');
            assert((0, comparers_1.compareFileNamesDefault)('', '') === 0, 'empty should be equal');
            assert((0, comparers_1.compareFileNamesDefault)('abc', 'abc') === 0, 'equal names should be equal');
            assert((0, comparers_1.compareFileNamesDefault)('z', 'A') > 0, 'z comes is after A regardless of case');
            assert((0, comparers_1.compareFileNamesDefault)('Z', 'a') > 0, 'Z comes after a regardless of case');
            // name plus extension comparisons
            assert((0, comparers_1.compareFileNamesDefault)('file.ext', 'file.ext') === 0, 'equal full names should be equal');
            assert((0, comparers_1.compareFileNamesDefault)('a.ext', 'b.ext') < 0, 'if equal extensions, filenames should be compared');
            assert((0, comparers_1.compareFileNamesDefault)('file.aaa', 'file.bbb') < 0, 'files with equal names should be compared by extensions');
            assert((0, comparers_1.compareFileNamesDefault)('bbb.aaa', 'aaa.bbb') > 0, 'files should be compared by names even if extensions compare differently');
            assert((0, comparers_1.compareFileNamesDefault)('aggregate.go', 'aggregate_repo.go') > 0, 'compares the whole filename in locale order');
            // dotfile comparisons
            assert((0, comparers_1.compareFileNamesDefault)('.abc', '.abc') === 0, 'equal dotfile names should be equal');
            assert((0, comparers_1.compareFileNamesDefault)('.env.', '.gitattributes') < 0, 'filenames starting with dots and with extensions should still sort properly');
            assert((0, comparers_1.compareFileNamesDefault)('.env', '.aaa.env') > 0, 'dotfiles sort alphabetically when they contain multiple dots');
            assert((0, comparers_1.compareFileNamesDefault)('.env', '.env.aaa') < 0, 'dotfiles with the same root sort shortest first');
            assert((0, comparers_1.compareFileNamesDefault)('.aaa_env', '.aaa.env') < 0, 'and underscore in a dotfile name will sort before a dot');
            // dotfile vs non-dotfile comparisons
            assert((0, comparers_1.compareFileNamesDefault)(null, '.abc') < 0, 'null should come before dotfiles');
            assert((0, comparers_1.compareFileNamesDefault)('.env', 'aaa') < 0, 'dotfiles come before filenames without extensions');
            assert((0, comparers_1.compareFileNamesDefault)('.env', 'aaa.env') < 0, 'dotfiles come before filenames with extensions');
            assert((0, comparers_1.compareFileNamesDefault)('.md', 'A.MD') < 0, 'dotfiles sort before uppercase files');
            assert((0, comparers_1.compareFileNamesDefault)('.MD', 'a.md') < 0, 'dotfiles sort before lowercase files');
            // numeric comparisons
            assert((0, comparers_1.compareFileNamesDefault)('1', '1') === 0, 'numerically equal full names should be equal');
            assert((0, comparers_1.compareFileNamesDefault)('abc1.txt', 'abc1.txt') === 0, 'equal filenames with numbers should be equal');
            assert((0, comparers_1.compareFileNamesDefault)('abc1.txt', 'abc2.txt') < 0, 'filenames with numbers should be in numerical order, not alphabetical order');
            assert((0, comparers_1.compareFileNamesDefault)('abc2.txt', 'abc10.txt') < 0, 'filenames with numbers should be in numerical order even when they are multiple digits long');
            assert((0, comparers_1.compareFileNamesDefault)('abc02.txt', 'abc010.txt') < 0, 'filenames with numbers that have leading zeros sort numerically');
            assert((0, comparers_1.compareFileNamesDefault)('abc1.10.txt', 'abc1.2.txt') > 0, 'numbers with dots between them are treated as two separate numbers, not one decimal number');
            //
            // Comparisons with different results than compareFileNames
            //
            // name-only comparisons
            assert((0, comparers_1.compareFileNamesDefault)('a', 'A') === compareLocale('a', 'A'), 'the same letter sorts by locale');
            assert((0, comparers_1.compareFileNamesDefault)('â', 'Â') === compareLocale('â', 'Â'), 'the same accented letter sorts by locale');
            assert.deepStrictEqual(['email', 'Email', 'émail', 'Émail'].sort(comparers_1.compareFileNamesDefault), ['email', 'Email', 'émail', 'Émail'].sort(compareLocale), 'the same base characters with different case or accents sort in locale order');
            // numeric comparisons
            assert((0, comparers_1.compareFileNamesDefault)('abc02.txt', 'abc002.txt') < 0, 'filenames with equivalent numbers and leading zeros sort shortest number first');
            assert((0, comparers_1.compareFileNamesDefault)('abc.txt1', 'abc.txt01') < 0, 'same name plus extensions with equal numbers sort shortest number first');
            assert((0, comparers_1.compareFileNamesDefault)('art01', 'Art01') === compareLocaleNumeric('art01', 'Art01'), 'a numerically equivalent word of a different case compares numerically based on locale');
        });
        test('compareFileExtensionsDefault', () => {
            //
            // Comparisons with the same result as compareFileExtensions
            //
            // name-only comparisons
            assert((0, comparers_1.compareFileExtensionsDefault)(null, null) === 0, 'null should be equal');
            assert((0, comparers_1.compareFileExtensionsDefault)(null, 'abc') < 0, 'null should come before real files without extensions');
            assert((0, comparers_1.compareFileExtensionsDefault)('', '') === 0, 'empty should be equal');
            assert((0, comparers_1.compareFileExtensionsDefault)('abc', 'abc') === 0, 'equal names should be equal');
            assert((0, comparers_1.compareFileExtensionsDefault)('z', 'A') > 0, 'z comes after A');
            assert((0, comparers_1.compareFileExtensionsDefault)('Z', 'a') > 0, 'Z comes after a');
            // name plus extension comparisons
            assert((0, comparers_1.compareFileExtensionsDefault)('file.ext', 'file.ext') === 0, 'equal full filenames should be equal');
            assert((0, comparers_1.compareFileExtensionsDefault)('a.ext', 'b.ext') < 0, 'if equal extensions, filenames should be compared');
            assert((0, comparers_1.compareFileExtensionsDefault)('file.aaa', 'file.bbb') < 0, 'files with equal names should be compared by extensions');
            assert((0, comparers_1.compareFileExtensionsDefault)('bbb.aaa', 'aaa.bbb') < 0, 'files should be compared by extension first');
            assert((0, comparers_1.compareFileExtensionsDefault)('agg.go', 'aggrepo.go') < 0, 'shorter names sort before longer names');
            assert((0, comparers_1.compareFileExtensionsDefault)('a.MD', 'b.md') < 0, 'when extensions are the same except for case, the files sort by name');
            // dotfile comparisons
            assert((0, comparers_1.compareFileExtensionsDefault)('.abc', '.abc') === 0, 'equal dotfiles should be equal');
            assert((0, comparers_1.compareFileExtensionsDefault)('.md', '.Gitattributes') > 0, 'dotfiles sort alphabetically regardless of case');
            // dotfile vs non-dotfile comparisons
            assert((0, comparers_1.compareFileExtensionsDefault)(null, '.abc') < 0, 'null should come before dotfiles');
            assert((0, comparers_1.compareFileExtensionsDefault)('.env', 'aaa.env') < 0, 'dotfiles come before filenames with extensions');
            assert((0, comparers_1.compareFileExtensionsDefault)('.MD', 'a.md') < 0, 'dotfiles sort before lowercase files');
            // numeric comparisons
            assert((0, comparers_1.compareFileExtensionsDefault)('1', '1') === 0, 'numerically equal full names should be equal');
            assert((0, comparers_1.compareFileExtensionsDefault)('abc1.txt', 'abc1.txt') === 0, 'equal filenames with numbers should be equal');
            assert((0, comparers_1.compareFileExtensionsDefault)('abc1.txt', 'abc2.txt') < 0, 'filenames with numbers should be in numerical order, not alphabetical order');
            assert((0, comparers_1.compareFileExtensionsDefault)('abc2.txt', 'abc10.txt') < 0, 'filenames with numbers should be in numerical order');
            assert((0, comparers_1.compareFileExtensionsDefault)('abc02.txt', 'abc010.txt') < 0, 'filenames with numbers that have leading zeros sort numerically');
            assert((0, comparers_1.compareFileExtensionsDefault)('abc1.10.txt', 'abc1.2.txt') > 0, 'numbers with dots between them are treated as two separate numbers, not one decimal number');
            assert((0, comparers_1.compareFileExtensionsDefault)('abc2.txt2', 'abc1.txt10') < 0, 'extensions with numbers should be in numerical order, not alphabetical order');
            assert((0, comparers_1.compareFileExtensionsDefault)('txt.abc1', 'txt.abc1') === 0, 'equal extensions with numbers should be equal');
            assert((0, comparers_1.compareFileExtensionsDefault)('txt.abc1', 'txt.abc2') < 0, 'extensions with numbers should be in numerical order, not alphabetical order');
            assert((0, comparers_1.compareFileExtensionsDefault)('txt.abc2', 'txt.abc10') < 0, 'extensions with numbers should be in numerical order even when they are multiple digits long');
            assert((0, comparers_1.compareFileExtensionsDefault)('a.ext1', 'b.ext1') < 0, 'if equal extensions with numbers, filenames should be compared');
            assert((0, comparers_1.compareFileExtensionsDefault)('a10.txt', 'A2.txt') > 0, 'filenames with number and case differences compare numerically');
            //
            // Comparisons with different results than compareFileExtensions
            //
            // name-only comparisons
            assert((0, comparers_1.compareFileExtensionsDefault)('a', 'A') === compareLocale('a', 'A'), 'the same letter of different case sorts by locale');
            assert((0, comparers_1.compareFileExtensionsDefault)('â', 'Â') === compareLocale('â', 'Â'), 'the same accented letter of different case sorts by locale');
            assert.deepStrictEqual(['email', 'Email', 'émail', 'Émail'].sort(comparers_1.compareFileExtensionsDefault), ['email', 'Email', 'émail', 'Émail'].sort((a, b) => a.localeCompare(b)), 'the same base characters with different case or accents sort in locale order');
            // name plus extension comparisons
            assert((0, comparers_1.compareFileExtensionsDefault)('a.MD', 'a.md') === compareLocale('MD', 'md'), 'case differences in extensions sort by locale');
            assert((0, comparers_1.compareFileExtensionsDefault)('a.md', 'A.md') === compareLocale('a', 'A'), 'case differences in names sort by locale');
            assert((0, comparers_1.compareFileExtensionsDefault)('aggregate.go', 'aggregate_repo.go') > 0, 'names with the same extension sort in full filename locale order');
            // dotfile comparisons
            assert((0, comparers_1.compareFileExtensionsDefault)('.env', '.aaa.env') > 0, 'dotfiles sort alphabetically when they contain multiple dots');
            assert((0, comparers_1.compareFileExtensionsDefault)('.env', '.env.aaa') < 0, 'dotfiles with the same root sort shortest first');
            // dotfile vs non-dotfile comparisons
            assert((0, comparers_1.compareFileExtensionsDefault)('.env', 'aaa') < 0, 'dotfiles come before filenames without extensions');
            assert((0, comparers_1.compareFileExtensionsDefault)('.md', 'A.MD') < 0, 'dotfiles sort before uppercase files');
            // numeric comparisons
            assert((0, comparers_1.compareFileExtensionsDefault)('abc.txt01', 'abc.txt1') > 0, 'extensions with equal numbers should be in shortest-first order');
            assert((0, comparers_1.compareFileExtensionsDefault)('art01', 'Art01') === compareLocaleNumeric('art01', 'Art01'), 'a numerically equivalent word of a different case compares numerically based on locale');
            assert((0, comparers_1.compareFileExtensionsDefault)('abc02.txt', 'abc002.txt') < 0, 'filenames with equivalent numbers and leading zeros sort shortest string first');
            assert((0, comparers_1.compareFileExtensionsDefault)('txt.abc01', 'txt.abc1') > 0, 'extensions with equivalent numbers sort shortest extension first');
        });
    });
});
//# sourceMappingURL=comparers.test.js.map