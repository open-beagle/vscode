/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/uri", "vs/workbench/api/common/extHostDiagnostics", "vs/workbench/api/common/extHostTypes", "vs/platform/markers/common/markers", "vs/base/test/common/mock", "vs/base/common/event", "vs/platform/log/common/log", "vs/workbench/services/extensions/common/extensions"], function (require, exports, assert, uri_1, extHostDiagnostics_1, extHostTypes_1, markers_1, mock_1, event_1, log_1, extensions_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('ExtHostDiagnostics', () => {
        class DiagnosticsShape extends (0, mock_1.mock)() {
            $changeMany(owner, entries) {
                //
            }
            $clear(owner) {
                //
            }
        }
        test('disposeCheck', () => {
            const collection = new extHostDiagnostics_1.DiagnosticCollection('test', 'test', 100, new DiagnosticsShape(), new event_1.Emitter());
            collection.dispose();
            collection.dispose(); // that's OK
            assert.throws(() => collection.name);
            assert.throws(() => collection.clear());
            assert.throws(() => collection.delete(uri_1.URI.parse('aa:bb')));
            assert.throws(() => collection.forEach(() => { }));
            assert.throws(() => collection.get(uri_1.URI.parse('aa:bb')));
            assert.throws(() => collection.has(uri_1.URI.parse('aa:bb')));
            assert.throws(() => collection.set(uri_1.URI.parse('aa:bb'), []));
            assert.throws(() => collection.set(uri_1.URI.parse('aa:bb'), undefined));
        });
        test('diagnostic collection, forEach, clear, has', function () {
            let collection = new extHostDiagnostics_1.DiagnosticCollection('test', 'test', 100, new DiagnosticsShape(), new event_1.Emitter());
            assert.strictEqual(collection.name, 'test');
            collection.dispose();
            assert.throws(() => collection.name);
            let c = 0;
            collection = new extHostDiagnostics_1.DiagnosticCollection('test', 'test', 100, new DiagnosticsShape(), new event_1.Emitter());
            collection.forEach(() => c++);
            assert.strictEqual(c, 0);
            collection.set(uri_1.URI.parse('foo:bar'), [
                new extHostTypes_1.Diagnostic(new extHostTypes_1.Range(0, 0, 1, 1), 'message-1'),
                new extHostTypes_1.Diagnostic(new extHostTypes_1.Range(0, 0, 1, 1), 'message-2')
            ]);
            collection.forEach(() => c++);
            assert.strictEqual(c, 1);
            c = 0;
            collection.clear();
            collection.forEach(() => c++);
            assert.strictEqual(c, 0);
            collection.set(uri_1.URI.parse('foo:bar1'), [
                new extHostTypes_1.Diagnostic(new extHostTypes_1.Range(0, 0, 1, 1), 'message-1'),
                new extHostTypes_1.Diagnostic(new extHostTypes_1.Range(0, 0, 1, 1), 'message-2')
            ]);
            collection.set(uri_1.URI.parse('foo:bar2'), [
                new extHostTypes_1.Diagnostic(new extHostTypes_1.Range(0, 0, 1, 1), 'message-1'),
                new extHostTypes_1.Diagnostic(new extHostTypes_1.Range(0, 0, 1, 1), 'message-2')
            ]);
            collection.forEach(() => c++);
            assert.strictEqual(c, 2);
            assert.ok(collection.has(uri_1.URI.parse('foo:bar1')));
            assert.ok(collection.has(uri_1.URI.parse('foo:bar2')));
            assert.ok(!collection.has(uri_1.URI.parse('foo:bar3')));
            collection.delete(uri_1.URI.parse('foo:bar1'));
            assert.ok(!collection.has(uri_1.URI.parse('foo:bar1')));
            collection.dispose();
        });
        test('diagnostic collection, immutable read', function () {
            let collection = new extHostDiagnostics_1.DiagnosticCollection('test', 'test', 100, new DiagnosticsShape(), new event_1.Emitter());
            collection.set(uri_1.URI.parse('foo:bar'), [
                new extHostTypes_1.Diagnostic(new extHostTypes_1.Range(0, 0, 1, 1), 'message-1'),
                new extHostTypes_1.Diagnostic(new extHostTypes_1.Range(0, 0, 1, 1), 'message-2')
            ]);
            let array = collection.get(uri_1.URI.parse('foo:bar'));
            assert.throws(() => array.length = 0);
            assert.throws(() => array.pop());
            assert.throws(() => array[0] = new extHostTypes_1.Diagnostic(new extHostTypes_1.Range(0, 0, 0, 0), 'evil'));
            collection.forEach((uri, array) => {
                assert.throws(() => array.length = 0);
                assert.throws(() => array.pop());
                assert.throws(() => array[0] = new extHostTypes_1.Diagnostic(new extHostTypes_1.Range(0, 0, 0, 0), 'evil'));
            });
            array = collection.get(uri_1.URI.parse('foo:bar'));
            assert.strictEqual(array.length, 2);
            collection.dispose();
        });
        test('diagnostics collection, set with dupliclated tuples', function () {
            let collection = new extHostDiagnostics_1.DiagnosticCollection('test', 'test', 100, new DiagnosticsShape(), new event_1.Emitter());
            let uri = uri_1.URI.parse('sc:hightower');
            collection.set([
                [uri, [new extHostTypes_1.Diagnostic(new extHostTypes_1.Range(0, 0, 0, 1), 'message-1')]],
                [uri_1.URI.parse('some:thing'), [new extHostTypes_1.Diagnostic(new extHostTypes_1.Range(0, 0, 1, 1), 'something')]],
                [uri, [new extHostTypes_1.Diagnostic(new extHostTypes_1.Range(0, 0, 0, 1), 'message-2')]],
            ]);
            let array = collection.get(uri);
            assert.strictEqual(array.length, 2);
            let [first, second] = array;
            assert.strictEqual(first.message, 'message-1');
            assert.strictEqual(second.message, 'message-2');
            // clear
            collection.delete(uri);
            assert.ok(!collection.has(uri));
            // bad tuple clears 1/2
            collection.set([
                [uri, [new extHostTypes_1.Diagnostic(new extHostTypes_1.Range(0, 0, 0, 1), 'message-1')]],
                [uri_1.URI.parse('some:thing'), [new extHostTypes_1.Diagnostic(new extHostTypes_1.Range(0, 0, 1, 1), 'something')]],
                [uri, undefined]
            ]);
            assert.ok(!collection.has(uri));
            // clear
            collection.delete(uri);
            assert.ok(!collection.has(uri));
            // bad tuple clears 2/2
            collection.set([
                [uri, [new extHostTypes_1.Diagnostic(new extHostTypes_1.Range(0, 0, 0, 1), 'message-1')]],
                [uri_1.URI.parse('some:thing'), [new extHostTypes_1.Diagnostic(new extHostTypes_1.Range(0, 0, 1, 1), 'something')]],
                [uri, undefined],
                [uri, [new extHostTypes_1.Diagnostic(new extHostTypes_1.Range(0, 0, 0, 1), 'message-2')]],
                [uri, [new extHostTypes_1.Diagnostic(new extHostTypes_1.Range(0, 0, 0, 1), 'message-3')]],
            ]);
            array = collection.get(uri);
            assert.strictEqual(array.length, 2);
            [first, second] = array;
            assert.strictEqual(first.message, 'message-2');
            assert.strictEqual(second.message, 'message-3');
            collection.dispose();
        });
        test('diagnostics collection, set tuple overrides, #11547', function () {
            let lastEntries;
            let collection = new extHostDiagnostics_1.DiagnosticCollection('test', 'test', 100, new class extends DiagnosticsShape {
                $changeMany(owner, entries) {
                    lastEntries = entries;
                    return super.$changeMany(owner, entries);
                }
            }, new event_1.Emitter());
            let uri = uri_1.URI.parse('sc:hightower');
            collection.set([[uri, [new extHostTypes_1.Diagnostic(new extHostTypes_1.Range(0, 0, 1, 1), 'error')]]]);
            assert.strictEqual(collection.get(uri).length, 1);
            assert.strictEqual(collection.get(uri)[0].message, 'error');
            assert.strictEqual(lastEntries.length, 1);
            let [[, data1]] = lastEntries;
            assert.strictEqual(data1.length, 1);
            assert.strictEqual(data1[0].message, 'error');
            lastEntries = undefined;
            collection.set([[uri, [new extHostTypes_1.Diagnostic(new extHostTypes_1.Range(0, 0, 1, 1), 'warning')]]]);
            assert.strictEqual(collection.get(uri).length, 1);
            assert.strictEqual(collection.get(uri)[0].message, 'warning');
            assert.strictEqual(lastEntries.length, 1);
            let [[, data2]] = lastEntries;
            assert.strictEqual(data2.length, 1);
            assert.strictEqual(data2[0].message, 'warning');
            lastEntries = undefined;
        });
        test('do send message when not making a change', function () {
            let changeCount = 0;
            let eventCount = 0;
            const emitter = new event_1.Emitter();
            emitter.event(_ => eventCount += 1);
            const collection = new extHostDiagnostics_1.DiagnosticCollection('test', 'test', 100, new class extends DiagnosticsShape {
                $changeMany() {
                    changeCount += 1;
                }
            }, emitter);
            let uri = uri_1.URI.parse('sc:hightower');
            let diag = new extHostTypes_1.Diagnostic(new extHostTypes_1.Range(0, 0, 0, 1), 'ffff');
            collection.set(uri, [diag]);
            assert.strictEqual(changeCount, 1);
            assert.strictEqual(eventCount, 1);
            collection.set(uri, [diag]);
            assert.strictEqual(changeCount, 2);
            assert.strictEqual(eventCount, 2);
        });
        test('diagnostics collection, tuples and undefined (small array), #15585', function () {
            const collection = new extHostDiagnostics_1.DiagnosticCollection('test', 'test', 100, new DiagnosticsShape(), new event_1.Emitter());
            let uri = uri_1.URI.parse('sc:hightower');
            let uri2 = uri_1.URI.parse('sc:nomad');
            let diag = new extHostTypes_1.Diagnostic(new extHostTypes_1.Range(0, 0, 0, 1), 'ffff');
            collection.set([
                [uri, [diag, diag, diag]],
                [uri, undefined],
                [uri, [diag]],
                [uri2, [diag, diag]],
                [uri2, undefined],
                [uri2, [diag]],
            ]);
            assert.strictEqual(collection.get(uri).length, 1);
            assert.strictEqual(collection.get(uri2).length, 1);
        });
        test('diagnostics collection, tuples and undefined (large array), #15585', function () {
            const collection = new extHostDiagnostics_1.DiagnosticCollection('test', 'test', 100, new DiagnosticsShape(), new event_1.Emitter());
            const tuples = [];
            for (let i = 0; i < 500; i++) {
                let uri = uri_1.URI.parse('sc:hightower#' + i);
                let diag = new extHostTypes_1.Diagnostic(new extHostTypes_1.Range(0, 0, 0, 1), i.toString());
                tuples.push([uri, [diag, diag, diag]]);
                tuples.push([uri, undefined]);
                tuples.push([uri, [diag]]);
            }
            collection.set(tuples);
            for (let i = 0; i < 500; i++) {
                let uri = uri_1.URI.parse('sc:hightower#' + i);
                assert.strictEqual(collection.has(uri), true);
                assert.strictEqual(collection.get(uri).length, 1);
            }
        });
        test('diagnostic capping', function () {
            let lastEntries;
            let collection = new extHostDiagnostics_1.DiagnosticCollection('test', 'test', 250, new class extends DiagnosticsShape {
                $changeMany(owner, entries) {
                    lastEntries = entries;
                    return super.$changeMany(owner, entries);
                }
            }, new event_1.Emitter());
            let uri = uri_1.URI.parse('aa:bb');
            let diagnostics = [];
            for (let i = 0; i < 500; i++) {
                diagnostics.push(new extHostTypes_1.Diagnostic(new extHostTypes_1.Range(i, 0, i + 1, 0), `error#${i}`, i < 300
                    ? extHostTypes_1.DiagnosticSeverity.Warning
                    : extHostTypes_1.DiagnosticSeverity.Error));
            }
            collection.set(uri, diagnostics);
            assert.strictEqual(collection.get(uri).length, 500);
            assert.strictEqual(lastEntries.length, 1);
            assert.strictEqual(lastEntries[0][1].length, 251);
            assert.strictEqual(lastEntries[0][1][0].severity, markers_1.MarkerSeverity.Error);
            assert.strictEqual(lastEntries[0][1][200].severity, markers_1.MarkerSeverity.Warning);
            assert.strictEqual(lastEntries[0][1][250].severity, markers_1.MarkerSeverity.Info);
        });
        test('diagnostic eventing', async function () {
            let emitter = new event_1.Emitter();
            let collection = new extHostDiagnostics_1.DiagnosticCollection('ddd', 'test', 100, new DiagnosticsShape(), emitter);
            let diag1 = new extHostTypes_1.Diagnostic(new extHostTypes_1.Range(1, 1, 2, 3), 'diag1');
            let diag2 = new extHostTypes_1.Diagnostic(new extHostTypes_1.Range(1, 1, 2, 3), 'diag2');
            let diag3 = new extHostTypes_1.Diagnostic(new extHostTypes_1.Range(1, 1, 2, 3), 'diag3');
            let p = event_1.Event.toPromise(emitter.event).then(a => {
                assert.strictEqual(a.length, 1);
                assert.strictEqual(a[0].toString(), 'aa:bb');
                assert.ok(uri_1.URI.isUri(a[0]));
            });
            collection.set(uri_1.URI.parse('aa:bb'), []);
            await p;
            p = event_1.Event.toPromise(emitter.event).then(e => {
                assert.strictEqual(e.length, 2);
                assert.ok(uri_1.URI.isUri(e[0]));
                assert.ok(uri_1.URI.isUri(e[1]));
                assert.strictEqual(e[0].toString(), 'aa:bb');
                assert.strictEqual(e[1].toString(), 'aa:cc');
            });
            collection.set([
                [uri_1.URI.parse('aa:bb'), [diag1]],
                [uri_1.URI.parse('aa:cc'), [diag2, diag3]],
            ]);
            await p;
            p = event_1.Event.toPromise(emitter.event).then(e => {
                assert.strictEqual(e.length, 2);
                assert.ok(uri_1.URI.isUri(e[0]));
                assert.ok(uri_1.URI.isUri(e[1]));
            });
            collection.clear();
            await p;
        });
        test('vscode.languages.onDidChangeDiagnostics Does Not Provide Document URI #49582', async function () {
            let emitter = new event_1.Emitter();
            let collection = new extHostDiagnostics_1.DiagnosticCollection('ddd', 'test', 100, new DiagnosticsShape(), emitter);
            let diag1 = new extHostTypes_1.Diagnostic(new extHostTypes_1.Range(1, 1, 2, 3), 'diag1');
            // delete
            collection.set(uri_1.URI.parse('aa:bb'), [diag1]);
            let p = event_1.Event.toPromise(emitter.event).then(e => {
                assert.strictEqual(e[0].toString(), 'aa:bb');
            });
            collection.delete(uri_1.URI.parse('aa:bb'));
            await p;
            // set->undefined (as delete)
            collection.set(uri_1.URI.parse('aa:bb'), [diag1]);
            p = event_1.Event.toPromise(emitter.event).then(e => {
                assert.strictEqual(e[0].toString(), 'aa:bb');
            });
            collection.set(uri_1.URI.parse('aa:bb'), undefined);
            await p;
        });
        test('diagnostics with related information', function (done) {
            let collection = new extHostDiagnostics_1.DiagnosticCollection('ddd', 'test', 100, new class extends DiagnosticsShape {
                $changeMany(owner, entries) {
                    let [[, data]] = entries;
                    assert.strictEqual(entries.length, 1);
                    assert.strictEqual(data.length, 1);
                    let [diag] = data;
                    assert.strictEqual(diag.relatedInformation.length, 2);
                    assert.strictEqual(diag.relatedInformation[0].message, 'more1');
                    assert.strictEqual(diag.relatedInformation[1].message, 'more2');
                    done();
                }
            }, new event_1.Emitter());
            let diag = new extHostTypes_1.Diagnostic(new extHostTypes_1.Range(0, 0, 1, 1), 'Foo');
            diag.relatedInformation = [
                new extHostTypes_1.DiagnosticRelatedInformation(new extHostTypes_1.Location(uri_1.URI.parse('cc:dd'), new extHostTypes_1.Range(0, 0, 0, 0)), 'more1'),
                new extHostTypes_1.DiagnosticRelatedInformation(new extHostTypes_1.Location(uri_1.URI.parse('cc:ee'), new extHostTypes_1.Range(0, 0, 0, 0)), 'more2')
            ];
            collection.set(uri_1.URI.parse('aa:bb'), [diag]);
        });
        test('vscode.languages.getDiagnostics appears to return old diagnostics in some circumstances #54359', function () {
            const ownerHistory = [];
            const diags = new extHostDiagnostics_1.ExtHostDiagnostics(new class {
                getProxy(id) {
                    return new class DiagnosticsShape {
                        $clear(owner) {
                            ownerHistory.push(owner);
                        }
                    };
                }
                set() {
                    return null;
                }
                assertRegistered() {
                }
                drain() {
                    return undefined;
                }
            }, new log_1.NullLogService());
            let collection1 = diags.createDiagnosticCollection(extensions_1.nullExtensionDescription.identifier, 'foo');
            let collection2 = diags.createDiagnosticCollection(extensions_1.nullExtensionDescription.identifier, 'foo'); // warns, uses a different owner
            collection1.clear();
            collection2.clear();
            assert.strictEqual(ownerHistory.length, 2);
            assert.strictEqual(ownerHistory[0], 'foo');
            assert.strictEqual(ownerHistory[1], 'foo0');
        });
        test('Error updating diagnostics from extension #60394', function () {
            let callCount = 0;
            let collection = new extHostDiagnostics_1.DiagnosticCollection('ddd', 'test', 100, new class extends DiagnosticsShape {
                $changeMany(owner, entries) {
                    callCount += 1;
                }
            }, new event_1.Emitter());
            let array = [];
            let diag1 = new extHostTypes_1.Diagnostic(new extHostTypes_1.Range(0, 0, 1, 1), 'Foo');
            let diag2 = new extHostTypes_1.Diagnostic(new extHostTypes_1.Range(0, 0, 1, 1), 'Bar');
            array.push(diag1, diag2);
            collection.set(uri_1.URI.parse('test:me'), array);
            assert.strictEqual(callCount, 1);
            collection.set(uri_1.URI.parse('test:me'), array);
            assert.strictEqual(callCount, 2); // equal array
            array.push(diag2);
            collection.set(uri_1.URI.parse('test:me'), array);
            assert.strictEqual(callCount, 3); // same but un-equal array
        });
        test('Diagnostics created by tasks aren\'t accessible to extensions #47292', async function () {
            const diags = new extHostDiagnostics_1.ExtHostDiagnostics(new class {
                getProxy(id) {
                    return {};
                }
                set() {
                    return null;
                }
                assertRegistered() {
                }
                drain() {
                    return undefined;
                }
            }, new log_1.NullLogService());
            //
            const uri = uri_1.URI.parse('foo:bar');
            const data = [{
                    message: 'message',
                    startLineNumber: 1,
                    startColumn: 1,
                    endLineNumber: 1,
                    endColumn: 1,
                    severity: 3
                }];
            const p1 = event_1.Event.toPromise(diags.onDidChangeDiagnostics);
            diags.$acceptMarkersChange([[uri, data]]);
            await p1;
            assert.strictEqual(diags.getDiagnostics(uri).length, 1);
            const p2 = event_1.Event.toPromise(diags.onDidChangeDiagnostics);
            diags.$acceptMarkersChange([[uri, []]]);
            await p2;
            assert.strictEqual(diags.getDiagnostics(uri).length, 0);
        });
    });
});
//# sourceMappingURL=extHostDiagnostics.test.js.map