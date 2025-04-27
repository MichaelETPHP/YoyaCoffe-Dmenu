
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    const identity = x => x;
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    let src_url_equal_anchor;
    function src_url_equal(element_src, url) {
        if (!src_url_equal_anchor) {
            src_url_equal_anchor = document.createElement('a');
        }
        src_url_equal_anchor.href = url;
        return element_src === src_url_equal_anchor.href;
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

    const tasks = new Set();
    function run_tasks(now) {
        tasks.forEach(task => {
            if (!task.c(now)) {
                tasks.delete(task);
                task.f();
            }
        });
        if (tasks.size !== 0)
            raf(run_tasks);
    }
    /**
     * Creates a new task that runs on each raf frame
     * until it returns a falsy value or is aborted
     */
    function loop(callback) {
        let task;
        if (tasks.size === 0)
            raf(run_tasks);
        return {
            promise: new Promise(fulfill => {
                tasks.add(task = { c: callback, f: fulfill });
            }),
            abort() {
                tasks.delete(task);
            }
        };
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
    function append(target, node) {
        target.appendChild(node);
    }
    function get_root_for_style(node) {
        if (!node)
            return document;
        const root = node.getRootNode ? node.getRootNode() : node.ownerDocument;
        if (root && root.host) {
            return root;
        }
        return node.ownerDocument;
    }
    function append_empty_stylesheet(node) {
        const style_element = element('style');
        append_stylesheet(get_root_for_style(node), style_element);
        return style_element.sheet;
    }
    function append_stylesheet(node, style) {
        append(node.head || node, style);
        return style.sheet;
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        if (node.parentNode) {
            node.parentNode.removeChild(node);
        }
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function to_number(value) {
        return value === '' ? null : +value;
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function custom_event(type, detail, { bubbles = false, cancelable = false } = {}) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, cancelable, detail);
        return e;
    }

    // we need to store the information for multiple documents because a Svelte application could also contain iframes
    // https://github.com/sveltejs/svelte/issues/3624
    const managed_styles = new Map();
    let active = 0;
    // https://github.com/darkskyapp/string-hash/blob/master/index.js
    function hash(str) {
        let hash = 5381;
        let i = str.length;
        while (i--)
            hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
        return hash >>> 0;
    }
    function create_style_information(doc, node) {
        const info = { stylesheet: append_empty_stylesheet(node), rules: {} };
        managed_styles.set(doc, info);
        return info;
    }
    function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
        const step = 16.666 / duration;
        let keyframes = '{\n';
        for (let p = 0; p <= 1; p += step) {
            const t = a + (b - a) * ease(p);
            keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
        }
        const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
        const name = `__svelte_${hash(rule)}_${uid}`;
        const doc = get_root_for_style(node);
        const { stylesheet, rules } = managed_styles.get(doc) || create_style_information(doc, node);
        if (!rules[name]) {
            rules[name] = true;
            stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
        }
        const animation = node.style.animation || '';
        node.style.animation = `${animation ? `${animation}, ` : ''}${name} ${duration}ms linear ${delay}ms 1 both`;
        active += 1;
        return name;
    }
    function delete_rule(node, name) {
        const previous = (node.style.animation || '').split(', ');
        const next = previous.filter(name
            ? anim => anim.indexOf(name) < 0 // remove specific animation
            : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
        );
        const deleted = previous.length - next.length;
        if (deleted) {
            node.style.animation = next.join(', ');
            active -= deleted;
            if (!active)
                clear_rules();
        }
    }
    function clear_rules() {
        raf(() => {
            if (active)
                return;
            managed_styles.forEach(info => {
                const { ownerNode } = info.stylesheet;
                // there is no ownerNode if it runs on jsdom.
                if (ownerNode)
                    detach(ownerNode);
            });
            managed_styles.clear();
        });
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    /**
     * The `onMount` function schedules a callback to run as soon as the component has been mounted to the DOM.
     * It must be called during the component's initialisation (but doesn't need to live *inside* the component;
     * it can be called from an external module).
     *
     * `onMount` does not run inside a [server-side component](/docs#run-time-server-side-component-api).
     *
     * https://svelte.dev/docs#run-time-svelte-onmount
     */
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    /**
     * Schedules a callback to run immediately before the component is unmounted.
     *
     * Out of `onMount`, `beforeUpdate`, `afterUpdate` and `onDestroy`, this is the
     * only one that runs inside a server-side component.
     *
     * https://svelte.dev/docs#run-time-svelte-ondestroy
     */
    function onDestroy(fn) {
        get_current_component().$$.on_destroy.push(fn);
    }
    /**
     * Creates an event dispatcher that can be used to dispatch [component events](/docs#template-syntax-component-directives-on-eventname).
     * Event dispatchers are functions that can take two arguments: `name` and `detail`.
     *
     * Component events created with `createEventDispatcher` create a
     * [CustomEvent](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent).
     * These events do not [bubble](https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Building_blocks/Events#Event_bubbling_and_capture).
     * The `detail` argument corresponds to the [CustomEvent.detail](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent/detail)
     * property and can contain any type of data.
     *
     * https://svelte.dev/docs#run-time-svelte-createeventdispatcher
     */
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail, { cancelable = false } = {}) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail, { cancelable });
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
                return !event.defaultPrevented;
            }
            return true;
        };
    }

    const dirty_components = [];
    const binding_callbacks = [];
    let render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = /* @__PURE__ */ Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function add_flush_callback(fn) {
        flush_callbacks.push(fn);
    }
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        // Do not reenter flush while dirty components are updated, as this can
        // result in an infinite loop. Instead, let the inner flush handle it.
        // Reentrancy is ok afterwards for bindings etc.
        if (flushidx !== 0) {
            return;
        }
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            try {
                while (flushidx < dirty_components.length) {
                    const component = dirty_components[flushidx];
                    flushidx++;
                    set_current_component(component);
                    update(component.$$);
                }
            }
            catch (e) {
                // reset dirty state to not end up in a deadlocked state and then rethrow
                dirty_components.length = 0;
                flushidx = 0;
                throw e;
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        seen_callbacks.clear();
        set_current_component(saved_component);
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    /**
     * Useful for example to execute remaining `afterUpdate` callbacks before executing `destroy`.
     */
    function flush_render_callbacks(fns) {
        const filtered = [];
        const targets = [];
        render_callbacks.forEach((c) => fns.indexOf(c) === -1 ? filtered.push(c) : targets.push(c));
        targets.forEach((c) => c());
        render_callbacks = filtered;
    }

    let promise;
    function wait() {
        if (!promise) {
            promise = Promise.resolve();
            promise.then(() => {
                promise = null;
            });
        }
        return promise;
    }
    function dispatch(node, direction, kind) {
        node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
        else if (callback) {
            callback();
        }
    }
    const null_transition = { duration: 0 };
    function create_bidirectional_transition(node, fn, params, intro) {
        const options = { direction: 'both' };
        let config = fn(node, params, options);
        let t = intro ? 0 : 1;
        let running_program = null;
        let pending_program = null;
        let animation_name = null;
        function clear_animation() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function init(program, duration) {
            const d = (program.b - t);
            duration *= Math.abs(d);
            return {
                a: t,
                b: program.b,
                d,
                duration,
                start: program.start,
                end: program.start + duration,
                group: program.group
            };
        }
        function go(b) {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            const program = {
                start: now() + delay,
                b
            };
            if (!b) {
                // @ts-ignore todo: improve typings
                program.group = outros;
                outros.r += 1;
            }
            if (running_program || pending_program) {
                pending_program = program;
            }
            else {
                // if this is an intro, and there's a delay, we need to do
                // an initial tick and/or apply CSS animation immediately
                if (css) {
                    clear_animation();
                    animation_name = create_rule(node, t, b, duration, delay, easing, css);
                }
                if (b)
                    tick(0, 1);
                running_program = init(program, duration);
                add_render_callback(() => dispatch(node, b, 'start'));
                loop(now => {
                    if (pending_program && now > pending_program.start) {
                        running_program = init(pending_program, duration);
                        pending_program = null;
                        dispatch(node, running_program.b, 'start');
                        if (css) {
                            clear_animation();
                            animation_name = create_rule(node, t, running_program.b, running_program.duration, 0, easing, config.css);
                        }
                    }
                    if (running_program) {
                        if (now >= running_program.end) {
                            tick(t = running_program.b, 1 - t);
                            dispatch(node, running_program.b, 'end');
                            if (!pending_program) {
                                // we're done
                                if (running_program.b) {
                                    // intro — we can tidy up immediately
                                    clear_animation();
                                }
                                else {
                                    // outro — needs to be coordinated
                                    if (!--running_program.group.r)
                                        run_all(running_program.group.c);
                                }
                            }
                            running_program = null;
                        }
                        else if (now >= running_program.start) {
                            const p = now - running_program.start;
                            t = running_program.a + running_program.d * easing(p / running_program.duration);
                            tick(t, 1 - t);
                        }
                    }
                    return !!(running_program || pending_program);
                });
            }
        }
        return {
            run(b) {
                if (is_function(config)) {
                    wait().then(() => {
                        // @ts-ignore
                        config = config(options);
                        go(b);
                    });
                }
                else {
                    go(b);
                }
            },
            end() {
                clear_animation();
                running_program = pending_program = null;
            }
        };
    }

    function bind(component, name, callback) {
        const index = component.$$.props[name];
        if (index !== undefined) {
            component.$$.bound[index] = callback;
            callback(component.$$.ctx[index]);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = component.$$.on_mount.map(run).filter(is_function);
                // if the component was destroyed immediately
                // it will update the `$$.on_destroy` reference to `null`.
                // the destructured on_destroy may still reference to the old array
                if (component.$$.on_destroy) {
                    component.$$.on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            flush_render_callbacks($$.after_update);
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: [],
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            if (!is_function(callback)) {
                return noop;
            }
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.59.2' }, detail), { bubbles: true }));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation, has_stop_immediate_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        if (has_stop_immediate_propagation)
            modifiers.push('stopImmediatePropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function prop_dev(node, property, value) {
        node[property] = value;
        dispatch_dev('SvelteDOMSetProperty', { node, property, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.data === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    function cubicOut(t) {
        const f = t - 1.0;
        return f * f * f + 1.0;
    }

    function fade(node, { delay = 0, duration = 400, easing = identity } = {}) {
        const o = +getComputedStyle(node).opacity;
        return {
            delay,
            duration,
            easing,
            css: t => `opacity: ${t * o}`
        };
    }
    function slide(node, { delay = 0, duration = 400, easing = cubicOut, axis = 'y' } = {}) {
        const style = getComputedStyle(node);
        const opacity = +style.opacity;
        const primary_property = axis === 'y' ? 'height' : 'width';
        const primary_property_value = parseFloat(style[primary_property]);
        const secondary_properties = axis === 'y' ? ['top', 'bottom'] : ['left', 'right'];
        const capitalized_secondary_properties = secondary_properties.map((e) => `${e[0].toUpperCase()}${e.slice(1)}`);
        const padding_start_value = parseFloat(style[`padding${capitalized_secondary_properties[0]}`]);
        const padding_end_value = parseFloat(style[`padding${capitalized_secondary_properties[1]}`]);
        const margin_start_value = parseFloat(style[`margin${capitalized_secondary_properties[0]}`]);
        const margin_end_value = parseFloat(style[`margin${capitalized_secondary_properties[1]}`]);
        const border_width_start_value = parseFloat(style[`border${capitalized_secondary_properties[0]}Width`]);
        const border_width_end_value = parseFloat(style[`border${capitalized_secondary_properties[1]}Width`]);
        return {
            delay,
            duration,
            easing,
            css: t => 'overflow: hidden;' +
                `opacity: ${Math.min(t * 20, 1) * opacity};` +
                `${primary_property}: ${t * primary_property_value}px;` +
                `padding-${secondary_properties[0]}: ${t * padding_start_value}px;` +
                `padding-${secondary_properties[1]}: ${t * padding_end_value}px;` +
                `margin-${secondary_properties[0]}: ${t * margin_start_value}px;` +
                `margin-${secondary_properties[1]}: ${t * margin_end_value}px;` +
                `border-${secondary_properties[0]}-width: ${t * border_width_start_value}px;` +
                `border-${secondary_properties[1]}-width: ${t * border_width_end_value}px;`
        };
    }

    /* src\components\TicTacToe.svelte generated by Svelte v3.59.2 */
    const file$a = "src\\components\\TicTacToe.svelte";

    function get_each_context$3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[26] = list[i];
    	child_ctx[28] = i;
    	return child_ctx;
    }

    // (239:25) 
    function create_if_block_1$5(ctx) {
    	let span;
    	let t_value = /*cell*/ ctx[26] + "";
    	let t;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(t_value);
    			attr_dev(span, "class", "text-3xl");
    			add_location(span, file$a, 239, 12, 6964);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*board*/ 1 && t_value !== (t_value = /*cell*/ ctx[26] + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$5.name,
    		type: "if",
    		source: "(239:25) ",
    		ctx
    	});

    	return block;
    }

    // (237:10) {#if cell === companyPlayer}
    function create_if_block$9(ctx) {
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			if (!src_url_equal(img.src, img_src_value = "/images/yoya-logo-transparent.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "Yoya Logo");
    			attr_dev(img, "class", "w-8 h-8 object-contain");
    			add_location(img, file$a, 237, 12, 6831);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$9.name,
    		type: "if",
    		source: "(237:10) {#if cell === companyPlayer}",
    		ctx
    	});

    	return block;
    }

    // (228:6) {#each board as cell, i}
    function create_each_block$3(ctx) {
    	let button;
    	let t;
    	let button_class_value;
    	let button_disabled_value;
    	let mounted;
    	let dispose;

    	function select_block_type(ctx, dirty) {
    		if (/*cell*/ ctx[26] === /*companyPlayer*/ ctx[9]) return create_if_block$9;
    		if (/*cell*/ ctx[26]) return create_if_block_1$5;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type && current_block_type(ctx);

    	function click_handler() {
    		return /*click_handler*/ ctx[14](/*i*/ ctx[28]);
    	}

    	const block = {
    		c: function create() {
    			button = element("button");
    			if (if_block) if_block.c();
    			t = space();

    			attr_dev(button, "class", button_class_value = "w-full aspect-square bg-white rounded-lg shadow transition-all duration-300 flex items-center justify-center " + (/*cells*/ ctx[7][/*i*/ ctx[28]]
    			? 'scale-100 opacity-100'
    			: 'scale-90 opacity-0') + " " + (/*isWinningCell*/ ctx[13](/*i*/ ctx[28]) && /*winAnimation*/ ctx[8]
    			? 'bg-coffee-200 animate-pulse'
    			: '') + " hover:bg-coffee-100 hover:shadow-md" + " svelte-51f43d");

    			button.disabled = button_disabled_value = !/*isPlayerTurn*/ ctx[5] || /*gameOver*/ ctx[2];
    			add_location(button, file$a, 228, 8, 6340);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			if (if_block) if_block.m(button, null);
    			append_dev(button, t);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", click_handler, false, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if (if_block) if_block.d(1);
    				if_block = current_block_type && current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(button, t);
    				}
    			}

    			if (dirty & /*cells, winAnimation*/ 384 && button_class_value !== (button_class_value = "w-full aspect-square bg-white rounded-lg shadow transition-all duration-300 flex items-center justify-center " + (/*cells*/ ctx[7][/*i*/ ctx[28]]
    			? 'scale-100 opacity-100'
    			: 'scale-90 opacity-0') + " " + (/*isWinningCell*/ ctx[13](/*i*/ ctx[28]) && /*winAnimation*/ ctx[8]
    			? 'bg-coffee-200 animate-pulse'
    			: '') + " hover:bg-coffee-100 hover:shadow-md" + " svelte-51f43d")) {
    				attr_dev(button, "class", button_class_value);
    			}

    			if (dirty & /*isPlayerTurn, gameOver*/ 36 && button_disabled_value !== (button_disabled_value = !/*isPlayerTurn*/ ctx[5] || /*gameOver*/ ctx[2])) {
    				prop_dev(button, "disabled", button_disabled_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);

    			if (if_block) {
    				if_block.d();
    			}

    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$3.name,
    		type: "each",
    		source: "(228:6) {#each board as cell, i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$a(ctx) {
    	let div8;
    	let div7;
    	let div0;
    	let h2;
    	let t1;
    	let button0;
    	let svg;
    	let path;
    	let t2;
    	let div1;
    	let p0;
    	let t3;
    	let t4;
    	let div4;
    	let div2;
    	let p1;
    	let t6;
    	let p2;
    	let t7;
    	let t8;
    	let div3;
    	let p3;
    	let t10;
    	let p4;
    	let t11;
    	let t12;
    	let div5;
    	let t13;
    	let div6;
    	let button1;
    	let div7_class_value;
    	let mounted;
    	let dispose;
    	let each_value = /*board*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$3(get_each_context$3(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div8 = element("div");
    			div7 = element("div");
    			div0 = element("div");
    			h2 = element("h2");
    			h2.textContent = "Yoya Coffee Tic-Tac-Toe";
    			t1 = space();
    			button0 = element("button");
    			svg = svg_element("svg");
    			path = svg_element("path");
    			t2 = space();
    			div1 = element("div");
    			p0 = element("p");
    			t3 = text(/*gameStatus*/ ctx[1]);
    			t4 = space();
    			div4 = element("div");
    			div2 = element("div");
    			p1 = element("p");
    			p1.textContent = "You";
    			t6 = space();
    			p2 = element("p");
    			t7 = text(/*playerScore*/ ctx[3]);
    			t8 = space();
    			div3 = element("div");
    			p3 = element("p");
    			p3.textContent = "Coffee Shop";
    			t10 = space();
    			p4 = element("p");
    			t11 = text(/*computerScore*/ ctx[4]);
    			t12 = space();
    			div5 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t13 = space();
    			div6 = element("div");
    			button1 = element("button");
    			button1.textContent = "Play Again";
    			attr_dev(h2, "class", "text-xl font-serif font-bold text-coffee-800");
    			add_location(h2, file$a, 197, 6, 5177);
    			attr_dev(path, "stroke-linecap", "round");
    			attr_dev(path, "stroke-linejoin", "round");
    			attr_dev(path, "stroke-width", "2");
    			attr_dev(path, "d", "M6 18L18 6M6 6l12 12");
    			add_location(path, file$a, 203, 10, 5517);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "class", "h-6 w-6");
    			attr_dev(svg, "fill", "none");
    			attr_dev(svg, "viewBox", "0 0 24 24");
    			attr_dev(svg, "stroke", "currentColor");
    			add_location(svg, file$a, 202, 8, 5396);
    			attr_dev(button0, "class", "text-coffee-500 hover:text-coffee-700 transition-colors svelte-51f43d");
    			add_location(button0, file$a, 198, 6, 5269);
    			attr_dev(div0, "class", "flex justify-between items-center mb-6");
    			add_location(div0, file$a, 196, 4, 5118);
    			attr_dev(p0, "class", "text-coffee-700 font-medium");
    			add_location(p0, file$a, 210, 6, 5728);
    			attr_dev(div1, "class", "text-center mb-4");
    			add_location(div1, file$a, 209, 4, 5691);
    			attr_dev(p1, "class", "text-coffee-600");
    			add_location(p1, file$a, 216, 8, 5908);
    			attr_dev(p2, "class", "text-2xl font-bold text-coffee-800");
    			add_location(p2, file$a, 217, 8, 5951);
    			attr_dev(div2, "class", "text-center");
    			add_location(div2, file$a, 215, 6, 5874);
    			attr_dev(p3, "class", "text-coffee-600");
    			add_location(p3, file$a, 220, 8, 6068);
    			attr_dev(p4, "class", "text-2xl font-bold text-coffee-800");
    			add_location(p4, file$a, 221, 8, 6119);
    			attr_dev(div3, "class", "text-center");
    			add_location(div3, file$a, 219, 6, 6034);
    			attr_dev(div4, "class", "flex justify-center gap-6 mb-6");
    			add_location(div4, file$a, 214, 4, 5823);
    			attr_dev(div5, "class", "grid grid-cols-3 gap-3 mb-6 mx-auto max-w-xs");
    			add_location(div5, file$a, 226, 4, 6242);
    			attr_dev(button1, "class", "px-6 py-2 bg-coffee-600 text-white font-medium rounded-lg hover:bg-coffee-700 transition-colors transform hover:scale-105 duration-200 svelte-51f43d");
    			add_location(button1, file$a, 247, 6, 7127);
    			attr_dev(div6, "class", "text-center");
    			add_location(div6, file$a, 246, 4, 7095);

    			attr_dev(div7, "class", div7_class_value = "relative bg-coffee-50 rounded-2xl shadow-2xl max-w-md w-full mx-auto p-5 transform transition-all duration-500 " + (/*boardVisible*/ ctx[6]
    			? 'translate-y-0 opacity-100'
    			: 'translate-y-8 opacity-0'));

    			add_location(div7, file$a, 192, 2, 4888);
    			attr_dev(div8, "class", "fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4");
    			add_location(div8, file$a, 191, 0, 4793);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div8, anchor);
    			append_dev(div8, div7);
    			append_dev(div7, div0);
    			append_dev(div0, h2);
    			append_dev(div0, t1);
    			append_dev(div0, button0);
    			append_dev(button0, svg);
    			append_dev(svg, path);
    			append_dev(div7, t2);
    			append_dev(div7, div1);
    			append_dev(div1, p0);
    			append_dev(p0, t3);
    			append_dev(div7, t4);
    			append_dev(div7, div4);
    			append_dev(div4, div2);
    			append_dev(div2, p1);
    			append_dev(div2, t6);
    			append_dev(div2, p2);
    			append_dev(p2, t7);
    			append_dev(div4, t8);
    			append_dev(div4, div3);
    			append_dev(div3, p3);
    			append_dev(div3, t10);
    			append_dev(div3, p4);
    			append_dev(p4, t11);
    			append_dev(div7, t12);
    			append_dev(div7, div5);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(div5, null);
    				}
    			}

    			append_dev(div7, t13);
    			append_dev(div7, div6);
    			append_dev(div6, button1);

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", /*closeGame*/ ctx[12], false, false, false, false),
    					listen_dev(button1, "click", /*resetGame*/ ctx[11], false, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*gameStatus*/ 2) set_data_dev(t3, /*gameStatus*/ ctx[1]);
    			if (dirty & /*playerScore*/ 8) set_data_dev(t7, /*playerScore*/ ctx[3]);
    			if (dirty & /*computerScore*/ 16) set_data_dev(t11, /*computerScore*/ ctx[4]);

    			if (dirty & /*cells, isWinningCell, winAnimation, isPlayerTurn, gameOver, handleClick, board, companyPlayer*/ 10149) {
    				each_value = /*board*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$3(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$3(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div5, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty & /*boardVisible*/ 64 && div7_class_value !== (div7_class_value = "relative bg-coffee-50 rounded-2xl shadow-2xl max-w-md w-full mx-auto p-5 transform transition-all duration-500 " + (/*boardVisible*/ ctx[6]
    			? 'translate-y-0 opacity-100'
    			: 'translate-y-8 opacity-0'))) {
    				attr_dev(div7, "class", div7_class_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div8);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$a($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('TicTacToe', slots, []);
    	const dispatch = createEventDispatcher();

    	// Game state
    	let board = Array(9).fill(null);

    	let currentPlayer = '☕'; // Coffee cup for player, company logo for computer
    	let companyPlayer = '🥤'; // Using a cup emoji as a placeholder, will be replaced with logo image
    	let winner = null;
    	let gameStatus = 'Play a relaxing game while you enjoy your coffee!';
    	let winningLine = [];
    	let gameOver = false;
    	let playerScore = 0;
    	let computerScore = 0;
    	let isPlayerTurn = true;

    	// Animation states
    	let boardVisible = false;

    	let cells = Array(9).fill(false); // Tracks if each cell has animated in
    	let winAnimation = false;

    	onMount(() => {
    		setTimeout(
    			() => {
    				$$invalidate(6, boardVisible = true);
    				animateCellsSequentially();
    			},
    			300
    		);
    	});

    	function animateCellsSequentially() {
    		for (let i = 0; i < 9; i++) {
    			setTimeout(
    				() => {
    					$$invalidate(7, cells[i] = true, cells);
    					$$invalidate(7, cells = [...cells]); // Trigger reactivity
    				},
    				i * 100
    			);
    		}
    	}

    	function handleClick(index) {
    		// Don't allow moves on filled squares or if game is over
    		if (board[index] || winner || !isPlayerTurn) return;

    		makeMove(index);

    		// Computer's turn after a short delay
    		if (!winner && !isBoardFull()) {
    			$$invalidate(5, isPlayerTurn = false);
    			setTimeout(computerMove, 700);
    		}
    	}

    	function makeMove(index) {
    		$$invalidate(0, board[index] = currentPlayer, board);
    		$$invalidate(0, board = [...board]); // Force reactivity
    		checkWinner();

    		if (!winner) {
    			// Switch players
    			currentPlayer = currentPlayer === '☕' ? companyPlayer : '☕';
    		}
    	}

    	function computerMove() {
    		if (winner || isBoardFull()) return;

    		// Try to find a good move
    		let index = findBestMove();

    		// Make the move
    		makeMove(index);

    		$$invalidate(5, isPlayerTurn = true);
    	}

    	function findBestMove() {
    		// First try to win
    		for (let i = 0; i < 9; i++) {
    			if (!board[i]) {
    				$$invalidate(0, board[i] = companyPlayer, board);

    				if (calculateWinner().winner) {
    					$$invalidate(0, board[i] = null, board); // Reset
    					return i;
    				}

    				$$invalidate(0, board[i] = null, board); // Reset
    			}
    		}

    		// Then try to block
    		for (let i = 0; i < 9; i++) {
    			if (!board[i]) {
    				$$invalidate(0, board[i] = '☕', board);

    				if (calculateWinner().winner) {
    					$$invalidate(0, board[i] = null, board); // Reset
    					return i;
    				}

    				$$invalidate(0, board[i] = null, board); // Reset
    			}
    		}

    		// Try center
    		if (!board[4]) return 4;

    		// Try corners
    		const corners = [0, 2, 6, 8];

    		const availableCorners = corners.filter(i => !board[i]);

    		if (availableCorners.length > 0) {
    			return availableCorners[Math.floor(Math.random() * availableCorners.length)];
    		}

    		// Try any available space
    		const available = board.map((cell, i) => cell === null ? i : null).filter(i => i !== null);

    		return available[Math.floor(Math.random() * available.length)];
    	}

    	function checkWinner() {
    		const result = calculateWinner();
    		winner = result.winner;
    		winningLine = result.line;

    		if (winner) {
    			$$invalidate(8, winAnimation = true);
    			$$invalidate(2, gameOver = true);

    			if (winner === '☕') {
    				$$invalidate(3, playerScore++, playerScore);
    				$$invalidate(1, gameStatus = "You won! ☕ rules!");
    			} else {
    				$$invalidate(4, computerScore++, computerScore);
    				$$invalidate(1, gameStatus = "The coffee shop won! Yoya rules!");
    			}
    		} else if (isBoardFull()) {
    			$$invalidate(2, gameOver = true);
    			$$invalidate(1, gameStatus = "It's a draw! Another round?");
    		} else {
    			$$invalidate(1, gameStatus = isPlayerTurn
    			? "Your turn - place your ☕"
    			: "The coffee shop is thinking...");
    		}
    	}

    	function calculateWinner() {
    		const lines = [
    			[0, 1, 2],
    			[3, 4, 5],
    			[6, 7, 8],
    			[0, 3, 6],
    			[1, 4, 7],
    			[2, 5, 8],
    			[0, 4, 8],
    			[2, 4, 6]
    		]; // horizontals
    		// verticals
    		// diagonals

    		for (const line of lines) {
    			const [a, b, c] = line;

    			if (board[a] && board[a] === board[b] && board[a] === board[c]) {
    				return { winner: board[a], line };
    			}
    		}

    		return { winner: null, line: [] };
    	}

    	function isBoardFull() {
    		return board.every(cell => cell !== null);
    	}

    	function resetGame() {
    		$$invalidate(0, board = Array(9).fill(null));
    		currentPlayer = '☕';
    		winner = null;
    		$$invalidate(1, gameStatus = 'Play a relaxing game while you enjoy your coffee!');
    		winningLine = [];
    		$$invalidate(2, gameOver = false);
    		$$invalidate(5, isPlayerTurn = true);
    		$$invalidate(8, winAnimation = false);

    		// Reset cell animations
    		$$invalidate(7, cells = Array(9).fill(false));

    		setTimeout(
    			() => {
    				animateCellsSequentially();
    			},
    			300
    		);
    	}

    	function closeGame() {
    		dispatch('close');
    	}

    	// Helper to check if a cell is in the winning line
    	function isWinningCell(index) {
    		return winningLine.includes(index);
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<TicTacToe> was created with unknown prop '${key}'`);
    	});

    	const click_handler = i => handleClick(i);

    	$$self.$capture_state = () => ({
    		onMount,
    		createEventDispatcher,
    		dispatch,
    		board,
    		currentPlayer,
    		companyPlayer,
    		winner,
    		gameStatus,
    		winningLine,
    		gameOver,
    		playerScore,
    		computerScore,
    		isPlayerTurn,
    		boardVisible,
    		cells,
    		winAnimation,
    		animateCellsSequentially,
    		handleClick,
    		makeMove,
    		computerMove,
    		findBestMove,
    		checkWinner,
    		calculateWinner,
    		isBoardFull,
    		resetGame,
    		closeGame,
    		isWinningCell
    	});

    	$$self.$inject_state = $$props => {
    		if ('board' in $$props) $$invalidate(0, board = $$props.board);
    		if ('currentPlayer' in $$props) currentPlayer = $$props.currentPlayer;
    		if ('companyPlayer' in $$props) $$invalidate(9, companyPlayer = $$props.companyPlayer);
    		if ('winner' in $$props) winner = $$props.winner;
    		if ('gameStatus' in $$props) $$invalidate(1, gameStatus = $$props.gameStatus);
    		if ('winningLine' in $$props) winningLine = $$props.winningLine;
    		if ('gameOver' in $$props) $$invalidate(2, gameOver = $$props.gameOver);
    		if ('playerScore' in $$props) $$invalidate(3, playerScore = $$props.playerScore);
    		if ('computerScore' in $$props) $$invalidate(4, computerScore = $$props.computerScore);
    		if ('isPlayerTurn' in $$props) $$invalidate(5, isPlayerTurn = $$props.isPlayerTurn);
    		if ('boardVisible' in $$props) $$invalidate(6, boardVisible = $$props.boardVisible);
    		if ('cells' in $$props) $$invalidate(7, cells = $$props.cells);
    		if ('winAnimation' in $$props) $$invalidate(8, winAnimation = $$props.winAnimation);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		board,
    		gameStatus,
    		gameOver,
    		playerScore,
    		computerScore,
    		isPlayerTurn,
    		boardVisible,
    		cells,
    		winAnimation,
    		companyPlayer,
    		handleClick,
    		resetGame,
    		closeGame,
    		isWinningCell,
    		click_handler
    	];
    }

    class TicTacToe extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "TicTacToe",
    			options,
    			id: create_fragment$a.name
    		});
    	}
    }

    /* src\components\Header.svelte generated by Svelte v3.59.2 */
    const file$9 = "src\\components\\Header.svelte";

    // (85:2) {#if isMenuOpen}
    function create_if_block_1$4(ctx) {
    	let div1;
    	let div0;
    	let button;
    	let span0;
    	let t1;
    	let span1;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			button = element("button");
    			span0 = element("span");
    			span0.textContent = "Play Tic-Tac-Toe";
    			t1 = space();
    			span1 = element("span");
    			span1.textContent = "🎮";
    			add_location(span0, file$9, 91, 10, 3642);
    			attr_dev(span1, "class", "ml-2 animate-pulse-slow svelte-q03j7t");
    			add_location(span1, file$9, 92, 10, 3682);
    			attr_dev(button, "class", "w-full block bg-cream-600 hover:bg-cream-500 text-coffee-900 px-4 py-2 my-2 rounded-lg font-medium text-center flex items-center justify-center");
    			add_location(button, file$9, 87, 8, 3416);
    			attr_dev(div0, "class", "px-4 pt-2 pb-4 space-y-3 animate-slide-down svelte-q03j7t");
    			add_location(div0, file$9, 86, 6, 3350);
    			attr_dev(div1, "class", "md:hidden bg-coffee-700 overflow-hidden");
    			add_location(div1, file$9, 85, 4, 3290);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div0, button);
    			append_dev(button, span0);
    			append_dev(button, t1);
    			append_dev(button, span1);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*openTicTacToe*/ ctx[4], false, false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$4.name,
    		type: "if",
    		source: "(85:2) {#if isMenuOpen}",
    		ctx
    	});

    	return block;
    }

    // (100:0) {#if showTicTacToe}
    function create_if_block$8(ctx) {
    	let div;
    	let tictactoe;
    	let div_transition;
    	let current;
    	tictactoe = new TicTacToe({ $$inline: true });
    	tictactoe.$on("close", /*closeTicTacToe*/ ctx[3]);

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(tictactoe.$$.fragment);
    			add_location(div, file$9, 100, 2, 3813);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(tictactoe, div, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(tictactoe.$$.fragment, local);

    			add_render_callback(() => {
    				if (!current) return;
    				if (!div_transition) div_transition = create_bidirectional_transition(div, fade, {}, true);
    				div_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(tictactoe.$$.fragment, local);
    			if (!div_transition) div_transition = create_bidirectional_transition(div, fade, {}, false);
    			div_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(tictactoe);
    			if (detaching && div_transition) div_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$8.name,
    		type: "if",
    		source: "(100:0) {#if showTicTacToe}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$9(ctx) {
    	let header;
    	let div4;
    	let div2;
    	let div0;
    	let svg;
    	let path0;
    	let path1;
    	let t0;
    	let div1;
    	let h1;
    	let t2;
    	let p;
    	let t4;
    	let nav;
    	let button0;
    	let span0;
    	let t6;
    	let span1;
    	let t8;
    	let button1;
    	let div3;
    	let span2;
    	let span2_class_value;
    	let t9;
    	let span3;
    	let span3_class_value;
    	let t10;
    	let span4;
    	let span4_class_value;
    	let t11;
    	let t12;
    	let if_block1_anchor;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block0 = /*isMenuOpen*/ ctx[0] && create_if_block_1$4(ctx);
    	let if_block1 = /*showTicTacToe*/ ctx[1] && create_if_block$8(ctx);

    	const block = {
    		c: function create() {
    			header = element("header");
    			div4 = element("div");
    			div2 = element("div");
    			div0 = element("div");
    			svg = svg_element("svg");
    			path0 = svg_element("path");
    			path1 = svg_element("path");
    			t0 = space();
    			div1 = element("div");
    			h1 = element("h1");
    			h1.textContent = "Yoya Coffee";
    			t2 = space();
    			p = element("p");
    			p.textContent = "SPECIALTY COFFEE & PASTRIES";
    			t4 = space();
    			nav = element("nav");
    			button0 = element("button");
    			span0 = element("span");
    			span0.textContent = "Play Game";
    			t6 = space();
    			span1 = element("span");
    			span1.textContent = "🎮";
    			t8 = space();
    			button1 = element("button");
    			div3 = element("div");
    			span2 = element("span");
    			t9 = space();
    			span3 = element("span");
    			t10 = space();
    			span4 = element("span");
    			t11 = space();
    			if (if_block0) if_block0.c();
    			t12 = space();
    			if (if_block1) if_block1.c();
    			if_block1_anchor = empty();
    			attr_dev(path0, "stroke-linecap", "round");
    			attr_dev(path0, "stroke-linejoin", "round");
    			attr_dev(path0, "stroke-width", "2");
    			attr_dev(path0, "d", "M18 8h1a4 4 0 010 8h-1M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z");
    			add_location(path0, file$9, 40, 10, 1204);
    			attr_dev(path1, "stroke-linecap", "round");
    			attr_dev(path1, "stroke-linejoin", "round");
    			attr_dev(path1, "stroke-width", "2");
    			attr_dev(path1, "d", "M6 1v3M10 1v3M14 1v3");
    			add_location(path1, file$9, 41, 10, 1354);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "width", "42");
    			attr_dev(svg, "height", "42");
    			attr_dev(svg, "viewBox", "0 0 24 24");
    			attr_dev(svg, "fill", "none");
    			attr_dev(svg, "stroke", "currentColor");
    			attr_dev(svg, "class", "text-cream-300");
    			add_location(svg, file$9, 39, 8, 1053);
    			attr_dev(div0, "class", "transform transition-transform duration-300 hover:scale-105 animate-bounce-slow svelte-q03j7t");
    			add_location(div0, file$9, 38, 6, 951);
    			attr_dev(h1, "class", "heading-serif text-xl md:text-2xl lg:text-3xl font-bold tracking-wide");
    			add_location(h1, file$9, 47, 8, 1591);
    			attr_dev(p, "class", "text-xs md:text-sm text-cream-200 font-light tracking-wider");
    			add_location(p, file$9, 48, 8, 1698);
    			attr_dev(div1, "class", "animate-slide-in svelte-q03j7t");
    			add_location(div1, file$9, 46, 6, 1552);
    			attr_dev(div2, "class", "flex items-center space-x-3");
    			add_location(div2, file$9, 36, 4, 852);
    			add_location(span0, file$9, 58, 8, 2215);
    			attr_dev(span1, "class", "ml-1");
    			add_location(span1, file$9, 59, 8, 2246);
    			attr_dev(button0, "class", "bg-cream-600 hover:bg-cream-500 text-coffee-900 px-4 py-2 rounded-lg font-medium shadow-md hover:shadow-lg transform transition-all duration-300 hover:-translate-y-0.5 flex items-center");
    			add_location(button0, file$9, 54, 6, 1955);
    			attr_dev(nav, "class", "hidden md:flex items-center space-x-8");
    			add_location(nav, file$9, 53, 4, 1897);

    			attr_dev(span2, "class", span2_class_value = "absolute h-0.5 w-6 bg-current transform transition-all duration-300 ease-in-out " + (/*hamburgerRotate*/ ctx[2]
    			? 'rotate-45'
    			: '-translate-y-2'));

    			add_location(span2, file$9, 70, 8, 2649);
    			attr_dev(span3, "class", span3_class_value = "absolute h-0.5 w-6 bg-current transform transition-all duration-300 ease-in-out " + (/*hamburgerRotate*/ ctx[2] ? 'opacity-0' : 'opacity-100'));
    			add_location(span3, file$9, 73, 8, 2830);

    			attr_dev(span4, "class", span4_class_value = "absolute h-0.5 w-6 bg-current transform transition-all duration-300 ease-in-out " + (/*hamburgerRotate*/ ctx[2]
    			? '-rotate-45'
    			: 'translate-y-2'));

    			add_location(span4, file$9, 76, 8, 3008);
    			attr_dev(div3, "class", "w-6 h-6 relative flex justify-center items-center overflow-hidden");
    			add_location(div3, file$9, 69, 6, 2561);
    			attr_dev(button1, "class", "md:hidden text-white focus:outline-none p-2 rounded-lg hover:bg-coffee-700 transition-all duration-300");
    			attr_dev(button1, "aria-label", "Toggle menu");
    			add_location(button1, file$9, 64, 4, 2358);
    			attr_dev(div4, "class", "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between");
    			add_location(div4, file$9, 35, 2, 756);
    			attr_dev(header, "class", "bg-coffee-800 text-white shadow-soft sticky top-0 z-50");
    			add_location(header, file$9, 34, 0, 682);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, header, anchor);
    			append_dev(header, div4);
    			append_dev(div4, div2);
    			append_dev(div2, div0);
    			append_dev(div0, svg);
    			append_dev(svg, path0);
    			append_dev(svg, path1);
    			append_dev(div2, t0);
    			append_dev(div2, div1);
    			append_dev(div1, h1);
    			append_dev(div1, t2);
    			append_dev(div1, p);
    			append_dev(div4, t4);
    			append_dev(div4, nav);
    			append_dev(nav, button0);
    			append_dev(button0, span0);
    			append_dev(button0, t6);
    			append_dev(button0, span1);
    			append_dev(div4, t8);
    			append_dev(div4, button1);
    			append_dev(button1, div3);
    			append_dev(div3, span2);
    			append_dev(div3, t9);
    			append_dev(div3, span3);
    			append_dev(div3, t10);
    			append_dev(div3, span4);
    			append_dev(header, t11);
    			if (if_block0) if_block0.m(header, null);
    			insert_dev(target, t12, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, if_block1_anchor, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", /*openTicTacToe*/ ctx[4], false, false, false, false),
    					listen_dev(button1, "click", /*animateHamburger*/ ctx[5], false, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*hamburgerRotate*/ 4 && span2_class_value !== (span2_class_value = "absolute h-0.5 w-6 bg-current transform transition-all duration-300 ease-in-out " + (/*hamburgerRotate*/ ctx[2]
    			? 'rotate-45'
    			: '-translate-y-2'))) {
    				attr_dev(span2, "class", span2_class_value);
    			}

    			if (!current || dirty & /*hamburgerRotate*/ 4 && span3_class_value !== (span3_class_value = "absolute h-0.5 w-6 bg-current transform transition-all duration-300 ease-in-out " + (/*hamburgerRotate*/ ctx[2] ? 'opacity-0' : 'opacity-100'))) {
    				attr_dev(span3, "class", span3_class_value);
    			}

    			if (!current || dirty & /*hamburgerRotate*/ 4 && span4_class_value !== (span4_class_value = "absolute h-0.5 w-6 bg-current transform transition-all duration-300 ease-in-out " + (/*hamburgerRotate*/ ctx[2]
    			? '-rotate-45'
    			: 'translate-y-2'))) {
    				attr_dev(span4, "class", span4_class_value);
    			}

    			if (/*isMenuOpen*/ ctx[0]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_1$4(ctx);
    					if_block0.c();
    					if_block0.m(header, null);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*showTicTacToe*/ ctx[1]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty & /*showTicTacToe*/ 2) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block$8(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block1);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block1);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(header);
    			if (if_block0) if_block0.d();
    			if (detaching) detach_dev(t12);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(if_block1_anchor);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Header', slots, []);
    	const dispatch = createEventDispatcher();
    	let isMenuOpen = false;
    	let showTicTacToe = false;

    	function toggleMenu() {
    		$$invalidate(0, isMenuOpen = !isMenuOpen);
    	}

    	function closeTicTacToe() {
    		$$invalidate(1, showTicTacToe = false);
    	}

    	function openTicTacToe() {
    		$$invalidate(1, showTicTacToe = true);
    		if (isMenuOpen) toggleMenu();
    	}

    	// Animation variables
    	let hamburgerRotate = false;

    	function animateHamburger() {
    		$$invalidate(2, hamburgerRotate = !hamburgerRotate);

    		setTimeout(
    			() => {
    				toggleMenu();
    			},
    			100
    		);
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Header> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		fade,
    		TicTacToe,
    		dispatch,
    		isMenuOpen,
    		showTicTacToe,
    		toggleMenu,
    		closeTicTacToe,
    		openTicTacToe,
    		hamburgerRotate,
    		animateHamburger
    	});

    	$$self.$inject_state = $$props => {
    		if ('isMenuOpen' in $$props) $$invalidate(0, isMenuOpen = $$props.isMenuOpen);
    		if ('showTicTacToe' in $$props) $$invalidate(1, showTicTacToe = $$props.showTicTacToe);
    		if ('hamburgerRotate' in $$props) $$invalidate(2, hamburgerRotate = $$props.hamburgerRotate);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		isMenuOpen,
    		showTicTacToe,
    		hamburgerRotate,
    		closeTicTacToe,
    		openTicTacToe,
    		animateHamburger
    	];
    }

    class Header extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Header",
    			options,
    			id: create_fragment$9.name
    		});
    	}
    }

    /* src\components\MenuItem.svelte generated by Svelte v3.59.2 */

    const { Error: Error_1$1, console: console_1$2 } = globals;
    const file$8 = "src\\components\\MenuItem.svelte";

    // (175:2) {#if icon === 'coffee'}
    function create_if_block_9(ctx) {
    	let div5;
    	let div4;
    	let div0;
    	let t0;
    	let div1;
    	let t1;
    	let div2;
    	let t2;
    	let div3;

    	const block = {
    		c: function create() {
    			div5 = element("div");
    			div4 = element("div");
    			div0 = element("div");
    			t0 = space();
    			div1 = element("div");
    			t1 = space();
    			div2 = element("div");
    			t2 = space();
    			div3 = element("div");
    			attr_dev(div0, "class", "steam steam-one svelte-ldywu9");
    			add_location(div0, file$8, 177, 8, 6218);
    			attr_dev(div1, "class", "steam steam-two svelte-ldywu9");
    			add_location(div1, file$8, 178, 8, 6262);
    			attr_dev(div2, "class", "steam steam-three svelte-ldywu9");
    			add_location(div2, file$8, 179, 8, 6306);
    			attr_dev(div3, "class", "steam steam-four svelte-ldywu9");
    			add_location(div3, file$8, 180, 8, 6352);
    			attr_dev(div4, "class", "steam-container svelte-ldywu9");
    			add_location(div4, file$8, 176, 6, 6180);
    			attr_dev(div5, "class", "absolute top-0 right-3 z-10");
    			add_location(div5, file$8, 175, 4, 6132);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div5, anchor);
    			append_dev(div5, div4);
    			append_dev(div4, div0);
    			append_dev(div4, t0);
    			append_dev(div4, div1);
    			append_dev(div4, t1);
    			append_dev(div4, div2);
    			append_dev(div4, t2);
    			append_dev(div4, div3);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div5);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_9.name,
    		type: "if",
    		source: "(175:2) {#if icon === 'coffee'}",
    		ctx
    	});

    	return block;
    }

    // (187:2) {#if showFeedback}
    function create_if_block_8$1(ctx) {
    	let div1;
    	let div0;
    	let t;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			t = text(/*feedbackMessage*/ ctx[3]);
    			attr_dev(div0, "class", "bg-coffee-800 text-white px-3 py-2 rounded-full inline-block shadow-lg text-sm");
    			add_location(div0, file$8, 188, 6, 6570);
    			attr_dev(div1, "class", "absolute top-2 left-0 right-0 mx-auto text-center z-20 animate-fade-in-out svelte-ldywu9");
    			add_location(div1, file$8, 187, 4, 6475);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div0, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*feedbackMessage*/ 8) set_data_dev(t, /*feedbackMessage*/ ctx[3]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_8$1.name,
    		type: "if",
    		source: "(187:2) {#if showFeedback}",
    		ctx
    	});

    	return block;
    }

    // (196:2) {#if errorMessage}
    function create_if_block_7$1(ctx) {
    	let div1;
    	let div0;
    	let t;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			t = text(/*errorMessage*/ ctx[5]);
    			attr_dev(div0, "class", "bg-red-600 text-white px-3 py-2 rounded-full inline-block shadow-lg text-sm");
    			add_location(div0, file$8, 197, 6, 6869);
    			attr_dev(div1, "class", "absolute top-2 left-0 right-0 mx-auto text-center z-20 animate-fade-in-out svelte-ldywu9");
    			add_location(div1, file$8, 196, 4, 6774);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div0, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*errorMessage*/ 32) set_data_dev(t, /*errorMessage*/ ctx[5]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_7$1.name,
    		type: "if",
    		source: "(196:2) {#if errorMessage}",
    		ctx
    	});

    	return block;
    }

    // (236:8) {:else}
    function create_else_block$5(ctx) {
    	let circle;

    	const block = {
    		c: function create() {
    			circle = svg_element("circle");
    			attr_dev(circle, "cx", "12");
    			attr_dev(circle, "cy", "12");
    			attr_dev(circle, "r", "10");
    			add_location(circle, file$8, 236, 10, 9044);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, circle, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(circle);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$5.name,
    		type: "else",
    		source: "(236:8) {:else}",
    		ctx
    	});

    	return block;
    }

    // (234:36) 
    function create_if_block_6$1(ctx) {
    	let rect;

    	const block = {
    		c: function create() {
    			rect = svg_element("rect");
    			attr_dev(rect, "x", "3");
    			attr_dev(rect, "y", "3");
    			attr_dev(rect, "width", "18");
    			attr_dev(rect, "height", "18");
    			attr_dev(rect, "rx", "2");
    			attr_dev(rect, "ry", "2");
    			add_location(rect, file$8, 234, 10, 8955);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, rect, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(rect);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_6$1.name,
    		type: "if",
    		source: "(234:36) ",
    		ctx
    	});

    	return block;
    }

    // (232:38) 
    function create_if_block_5$1(ctx) {
    	let path;

    	const block = {
    		c: function create() {
    			path = svg_element("path");
    			attr_dev(path, "d", "M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z");
    			add_location(path, file$8, 232, 10, 8801);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, path, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(path);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5$1.name,
    		type: "if",
    		source: "(232:38) ",
    		ctx
    	});

    	return block;
    }

    // (230:37) 
    function create_if_block_4$1(ctx) {
    	let path;

    	const block = {
    		c: function create() {
    			path = svg_element("path");
    			attr_dev(path, "d", "M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z");
    			add_location(path, file$8, 230, 10, 8696);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, path, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(path);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4$1.name,
    		type: "if",
    		source: "(230:37) ",
    		ctx
    	});

    	return block;
    }

    // (228:41) 
    function create_if_block_3$1(ctx) {
    	let path;

    	const block = {
    		c: function create() {
    			path = svg_element("path");
    			attr_dev(path, "d", "M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z");
    			add_location(path, file$8, 228, 10, 8573);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, path, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(path);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3$1.name,
    		type: "if",
    		source: "(228:41) ",
    		ctx
    	});

    	return block;
    }

    // (222:8) {#if icon === 'coffee'}
    function create_if_block_2$3(ctx) {
    	let path0;
    	let path1;
    	let line0;
    	let line1;
    	let line2;

    	const block = {
    		c: function create() {
    			path0 = svg_element("path");
    			path1 = svg_element("path");
    			line0 = svg_element("line");
    			line1 = svg_element("line");
    			line2 = svg_element("line");
    			attr_dev(path0, "d", "M18 8h1a4 4 0 010 8h-1");
    			add_location(path0, file$8, 222, 10, 8251);
    			attr_dev(path1, "d", "M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z");
    			add_location(path1, file$8, 223, 10, 8302);
    			attr_dev(line0, "x1", "6");
    			attr_dev(line0, "y1", "1");
    			attr_dev(line0, "x2", "6");
    			attr_dev(line0, "y2", "4");
    			add_location(line0, file$8, 224, 10, 8371);
    			attr_dev(line1, "x1", "10");
    			attr_dev(line1, "y1", "1");
    			attr_dev(line1, "x2", "10");
    			attr_dev(line1, "y2", "4");
    			add_location(line1, file$8, 225, 10, 8423);
    			attr_dev(line2, "x1", "14");
    			attr_dev(line2, "y1", "1");
    			attr_dev(line2, "x2", "14");
    			attr_dev(line2, "y2", "4");
    			add_location(line2, file$8, 226, 10, 8477);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, path0, anchor);
    			insert_dev(target, path1, anchor);
    			insert_dev(target, line0, anchor);
    			insert_dev(target, line1, anchor);
    			insert_dev(target, line2, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(path0);
    			if (detaching) detach_dev(path1);
    			if (detaching) detach_dev(line0);
    			if (detaching) detach_dev(line1);
    			if (detaching) detach_dev(line2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$3.name,
    		type: "if",
    		source: "(222:8) {#if icon === 'coffee'}",
    		ctx
    	});

    	return block;
    }

    // (262:10) {#if item.likes && item.likes > 0}
    function create_if_block_1$3(ctx) {
    	let span;
    	let t_value = /*item*/ ctx[0].likes + "";
    	let t;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(t_value);
    			attr_dev(span, "class", "absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center");
    			add_location(span, file$8, 262, 12, 10428);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*item*/ 1 && t_value !== (t_value = /*item*/ ctx[0].likes + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$3.name,
    		type: "if",
    		source: "(262:10) {#if item.likes && item.likes > 0}",
    		ctx
    	});

    	return block;
    }

    // (277:10) {#if item.dislikes && item.dislikes > 0}
    function create_if_block$7(ctx) {
    	let span;
    	let t_value = /*item*/ ctx[0].dislikes + "";
    	let t;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(t_value);
    			attr_dev(span, "class", "absolute -top-2 -right-2 bg-gray-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center");
    			add_location(span, file$8, 277, 12, 11204);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*item*/ 1 && t_value !== (t_value = /*item*/ ctx[0].dislikes + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$7.name,
    		type: "if",
    		source: "(277:10) {#if item.dislikes && item.dislikes > 0}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$8(ctx) {
    	let div9;
    	let t0;
    	let t1;
    	let t2;
    	let div0;
    	let img;
    	let img_src_value;
    	let img_alt_value;
    	let t3;
    	let div8;
    	let div2;
    	let div1;
    	let h3;
    	let t4_value = /*item*/ ctx[0].name + "";
    	let t4;
    	let t5;
    	let p;
    	let t6_value = /*item*/ ctx[0].description + "";
    	let t6;
    	let t7;
    	let div3;
    	let svg;
    	let t8;
    	let span0;
    	let t10;
    	let div4;
    	let t11;
    	let div7;
    	let div5;
    	let span1;
    	let t12_value = /*item*/ ctx[0].price + "";
    	let t12;
    	let t13;
    	let t14;
    	let div6;
    	let button0;
    	let span2;
    	let t16;
    	let button0_class_value;
    	let button0_disabled_value;
    	let t17;
    	let button1;
    	let span3;
    	let t19;
    	let button1_class_value;
    	let button1_disabled_value;
    	let mounted;
    	let dispose;
    	let if_block0 = /*icon*/ ctx[6] === 'coffee' && create_if_block_9(ctx);
    	let if_block1 = /*showFeedback*/ ctx[4] && create_if_block_8$1(ctx);
    	let if_block2 = /*errorMessage*/ ctx[5] && create_if_block_7$1(ctx);

    	function select_block_type(ctx, dirty) {
    		if (/*icon*/ ctx[6] === 'coffee') return create_if_block_2$3;
    		if (/*icon*/ ctx[6] === 'thermometer') return create_if_block_3$1;
    		if (/*icon*/ ctx[6] === 'droplet') return create_if_block_4$1;
    		if (/*icon*/ ctx[6] === 'triangle') return create_if_block_5$1;
    		if (/*icon*/ ctx[6] === 'square') return create_if_block_6$1;
    		return create_else_block$5;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block3 = current_block_type(ctx);
    	let if_block4 = /*item*/ ctx[0].likes && /*item*/ ctx[0].likes > 0 && create_if_block_1$3(ctx);
    	let if_block5 = /*item*/ ctx[0].dislikes && /*item*/ ctx[0].dislikes > 0 && create_if_block$7(ctx);

    	const block = {
    		c: function create() {
    			div9 = element("div");
    			if (if_block0) if_block0.c();
    			t0 = space();
    			if (if_block1) if_block1.c();
    			t1 = space();
    			if (if_block2) if_block2.c();
    			t2 = space();
    			div0 = element("div");
    			img = element("img");
    			t3 = space();
    			div8 = element("div");
    			div2 = element("div");
    			div1 = element("div");
    			h3 = element("h3");
    			t4 = text(t4_value);
    			t5 = space();
    			p = element("p");
    			t6 = text(t6_value);
    			t7 = space();
    			div3 = element("div");
    			svg = svg_element("svg");
    			if_block3.c();
    			t8 = space();
    			span0 = element("span");
    			span0.textContent = `${/*icon*/ ctx[6].charAt(0).toUpperCase() + /*icon*/ ctx[6].slice(1)}`;
    			t10 = space();
    			div4 = element("div");
    			t11 = space();
    			div7 = element("div");
    			div5 = element("div");
    			span1 = element("span");
    			t12 = text(t12_value);
    			t13 = text(" ETB");
    			t14 = space();
    			div6 = element("div");
    			button0 = element("button");
    			span2 = element("span");
    			span2.textContent = "❤️";
    			t16 = space();
    			if (if_block4) if_block4.c();
    			t17 = space();
    			button1 = element("button");
    			span3 = element("span");
    			span3.textContent = "👎";
    			t19 = space();
    			if (if_block5) if_block5.c();
    			if (!src_url_equal(img.src, img_src_value = /*item*/ ctx[0].image)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", img_alt_value = /*item*/ ctx[0].name);
    			attr_dev(img, "class", "w-full h-full object-cover transition-transform duration-700 group-hover:scale-110");
    			add_location(img, file$8, 205, 4, 7087);
    			attr_dev(div0, "class", "w-full h-48 overflow-hidden");
    			add_location(div0, file$8, 204, 2, 7041);
    			attr_dev(h3, "class", "font-semibold text-lg sm:text-xl text-coffee-800 heading-serif group-hover:text-coffee-600 transition-colors");
    			add_location(h3, file$8, 213, 8, 7402);
    			attr_dev(p, "class", "text-coffee-600 text-sm mt-1 line-clamp-2 group-hover:line-clamp-none transition-all duration-300");
    			add_location(p, file$8, 214, 8, 7548);
    			attr_dev(div1, "class", "flex-1 pr-3");
    			add_location(div1, file$8, 212, 6, 7368);
    			attr_dev(div2, "class", "flex justify-between items-start");
    			add_location(div2, file$8, 210, 4, 7278);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "width", "16");
    			attr_dev(svg, "height", "16");
    			attr_dev(svg, "viewBox", "0 0 24 24");
    			attr_dev(svg, "fill", "none");
    			attr_dev(svg, "stroke", "currentColor");
    			attr_dev(svg, "stroke-width", "2");
    			attr_dev(svg, "stroke-linecap", "round");
    			attr_dev(svg, "stroke-linejoin", "round");
    			attr_dev(svg, "class", "text-coffee-600 mr-1 group-hover:text-coffee-800 transition-colors duration-300 group-hover:rotate-12 transform");
    			add_location(svg, file$8, 220, 6, 7907);
    			attr_dev(span0, "class", "text-xs text-coffee-700 group-hover:text-coffee-900 transition-colors duration-300");
    			add_location(span0, file$8, 239, 6, 9118);
    			attr_dev(div3, "class", "mt-2 inline-flex items-center px-2 py-1 bg-coffee-100 rounded-full group-hover:bg-coffee-200 transition-colors duration-300");
    			add_location(div3, file$8, 219, 4, 7763);
    			attr_dev(div4, "class", "my-4 h-px bg-gradient-to-r from-transparent via-coffee-200 to-transparent group-hover:via-coffee-300 transition-colors duration-500");
    			add_location(div4, file$8, 243, 4, 9338);
    			attr_dev(span1, "class", "text-coffee-800 font-bold text-lg group-hover:text-coffee-900 transition-colors duration-300 transform group-hover:scale-105");
    			add_location(span1, file$8, 248, 8, 9632);
    			attr_dev(div5, "class", "flex flex-col");
    			add_location(div5, file$8, 247, 6, 9596);
    			attr_dev(span2, "class", "text-lg group-hover:scale-110 transition-transform duration-200");
    			add_location(span2, file$8, 260, 10, 10283);

    			attr_dev(button0, "class", button0_class_value = "group relative w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 " + (/*likeInProgress*/ ctx[1]
    			? 'opacity-70 cursor-wait'
    			: 'hover:bg-red-50') + " bg-gray-100");

    			attr_dev(button0, "aria-label", "Like this item");
    			button0.disabled = button0_disabled_value = /*likeInProgress*/ ctx[1] || /*dislikeInProgress*/ ctx[2];
    			add_location(button0, file$8, 254, 8, 9934);
    			attr_dev(span3, "class", "text-lg group-hover:scale-110 transition-transform duration-200");
    			add_location(span3, file$8, 275, 10, 11053);

    			attr_dev(button1, "class", button1_class_value = "group relative w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 " + (/*dislikeInProgress*/ ctx[2]
    			? 'opacity-70 cursor-wait'
    			: 'hover:bg-gray-200') + " bg-gray-100");

    			attr_dev(button1, "aria-label", "Dislike this item");
    			button1.disabled = button1_disabled_value = /*likeInProgress*/ ctx[1] || /*dislikeInProgress*/ ctx[2];
    			add_location(button1, file$8, 269, 8, 10693);
    			attr_dev(div6, "class", "flex space-x-2");
    			add_location(div6, file$8, 252, 6, 9857);
    			attr_dev(div7, "class", "flex justify-between items-center");
    			add_location(div7, file$8, 246, 4, 9542);
    			attr_dev(div8, "class", "p-5");
    			add_location(div8, file$8, 208, 2, 7231);
    			attr_dev(div9, "class", "menu-item group bg-white rounded-2xl shadow-soft overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-coffee-100 animate-fade-in relative svelte-ldywu9");
    			add_location(div9, file$8, 172, 0, 5866);
    		},
    		l: function claim(nodes) {
    			throw new Error_1$1("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div9, anchor);
    			if (if_block0) if_block0.m(div9, null);
    			append_dev(div9, t0);
    			if (if_block1) if_block1.m(div9, null);
    			append_dev(div9, t1);
    			if (if_block2) if_block2.m(div9, null);
    			append_dev(div9, t2);
    			append_dev(div9, div0);
    			append_dev(div0, img);
    			append_dev(div9, t3);
    			append_dev(div9, div8);
    			append_dev(div8, div2);
    			append_dev(div2, div1);
    			append_dev(div1, h3);
    			append_dev(h3, t4);
    			append_dev(div1, t5);
    			append_dev(div1, p);
    			append_dev(p, t6);
    			append_dev(div8, t7);
    			append_dev(div8, div3);
    			append_dev(div3, svg);
    			if_block3.m(svg, null);
    			append_dev(div3, t8);
    			append_dev(div3, span0);
    			append_dev(div8, t10);
    			append_dev(div8, div4);
    			append_dev(div8, t11);
    			append_dev(div8, div7);
    			append_dev(div7, div5);
    			append_dev(div5, span1);
    			append_dev(span1, t12);
    			append_dev(span1, t13);
    			append_dev(div7, t14);
    			append_dev(div7, div6);
    			append_dev(div6, button0);
    			append_dev(button0, span2);
    			append_dev(button0, t16);
    			if (if_block4) if_block4.m(button0, null);
    			append_dev(div6, t17);
    			append_dev(div6, button1);
    			append_dev(button1, span3);
    			append_dev(button1, t19);
    			if (if_block5) if_block5.m(button1, null);

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", /*handleLike*/ ctx[7], false, false, false, false),
    					listen_dev(button1, "click", /*handleDislike*/ ctx[8], false, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*showFeedback*/ ctx[4]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_8$1(ctx);
    					if_block1.c();
    					if_block1.m(div9, t1);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (/*errorMessage*/ ctx[5]) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);
    				} else {
    					if_block2 = create_if_block_7$1(ctx);
    					if_block2.c();
    					if_block2.m(div9, t2);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}

    			if (dirty & /*item*/ 1 && !src_url_equal(img.src, img_src_value = /*item*/ ctx[0].image)) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*item*/ 1 && img_alt_value !== (img_alt_value = /*item*/ ctx[0].name)) {
    				attr_dev(img, "alt", img_alt_value);
    			}

    			if (dirty & /*item*/ 1 && t4_value !== (t4_value = /*item*/ ctx[0].name + "")) set_data_dev(t4, t4_value);
    			if (dirty & /*item*/ 1 && t6_value !== (t6_value = /*item*/ ctx[0].description + "")) set_data_dev(t6, t6_value);
    			if (dirty & /*item*/ 1 && t12_value !== (t12_value = /*item*/ ctx[0].price + "")) set_data_dev(t12, t12_value);

    			if (/*item*/ ctx[0].likes && /*item*/ ctx[0].likes > 0) {
    				if (if_block4) {
    					if_block4.p(ctx, dirty);
    				} else {
    					if_block4 = create_if_block_1$3(ctx);
    					if_block4.c();
    					if_block4.m(button0, null);
    				}
    			} else if (if_block4) {
    				if_block4.d(1);
    				if_block4 = null;
    			}

    			if (dirty & /*likeInProgress*/ 2 && button0_class_value !== (button0_class_value = "group relative w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 " + (/*likeInProgress*/ ctx[1]
    			? 'opacity-70 cursor-wait'
    			: 'hover:bg-red-50') + " bg-gray-100")) {
    				attr_dev(button0, "class", button0_class_value);
    			}

    			if (dirty & /*likeInProgress, dislikeInProgress*/ 6 && button0_disabled_value !== (button0_disabled_value = /*likeInProgress*/ ctx[1] || /*dislikeInProgress*/ ctx[2])) {
    				prop_dev(button0, "disabled", button0_disabled_value);
    			}

    			if (/*item*/ ctx[0].dislikes && /*item*/ ctx[0].dislikes > 0) {
    				if (if_block5) {
    					if_block5.p(ctx, dirty);
    				} else {
    					if_block5 = create_if_block$7(ctx);
    					if_block5.c();
    					if_block5.m(button1, null);
    				}
    			} else if (if_block5) {
    				if_block5.d(1);
    				if_block5 = null;
    			}

    			if (dirty & /*dislikeInProgress*/ 4 && button1_class_value !== (button1_class_value = "group relative w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 " + (/*dislikeInProgress*/ ctx[2]
    			? 'opacity-70 cursor-wait'
    			: 'hover:bg-gray-200') + " bg-gray-100")) {
    				attr_dev(button1, "class", button1_class_value);
    			}

    			if (dirty & /*likeInProgress, dislikeInProgress*/ 6 && button1_disabled_value !== (button1_disabled_value = /*likeInProgress*/ ctx[1] || /*dislikeInProgress*/ ctx[2])) {
    				prop_dev(button1, "disabled", button1_disabled_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div9);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			if (if_block2) if_block2.d();
    			if_block3.d();
    			if (if_block4) if_block4.d();
    			if (if_block5) if_block5.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function determineItemIcon(item) {
    	// First try to use categoryName if available
    	if (item.categoryName) {
    		const category = item.categoryName.toLowerCase();
    		if (category.includes('hot')) return 'coffee';
    		if (category.includes('cold') || category.includes('iced')) return 'thermometer';
    		if (category.includes('espresso')) return 'coffee';
    		if (category.includes('pastry') || category.includes('bakery')) return 'triangle';
    		if (category.includes('sandwich')) return 'square';
    	}

    	// Fallback to ID-based mapping
    	const iconMap = {
    		'espresso': 'coffee',
    		'americano': 'coffee',
    		'cappuccino': 'coffee',
    		'latte': 'coffee',
    		'mocha': 'coffee',
    		'hot-chocolate': 'coffee',
    		'iced-coffee': 'thermometer',
    		'cold-brew': 'droplet',
    		'iced-latte': 'thermometer',
    		'iced-mocha': 'thermometer',
    		'frappe': 'thermometer',
    		'caramel-macchiato': 'coffee',
    		'vanilla-latte': 'coffee',
    		'chai-latte': 'coffee',
    		'matcha-latte': 'coffee',
    		'croissant': 'triangle',
    		'chocolate-croissant': 'triangle',
    		'muffin': 'circle',
    		'cinnamon-roll': 'circle',
    		'avocado-toast': 'square',
    		'egg-sandwich': 'square',
    		'turkey-sandwich': 'square'
    	};

    	// Try to match based on name if id-based mapping fails
    	if (!iconMap[item.id]) {
    		const name = item.name.toLowerCase();
    		if (name.includes('coffee') || name.includes('latte') || name.includes('espresso')) return 'coffee';
    		if (name.includes('cold') || name.includes('iced')) return 'thermometer';
    		if (name.includes('croissant') || name.includes('pastry')) return 'triangle';
    		if (name.includes('sandwich') || name.includes('toast')) return 'square';
    		if (name.includes('muffin') || name.includes('cookie')) return 'circle';
    	}

    	return iconMap[item.id] || 'circle';
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('MenuItem', slots, []);
    	let { item } = $$props;

    	// State for feedback and UI
    	let likeInProgress = false;

    	let dislikeInProgress = false;
    	let feedbackMessage = "";
    	let showFeedback = false;
    	let errorMessage = null;
    	const icon = determineItemIcon(item);

    	// Function to like an item via API
    	async function handleLike() {
    		if (likeInProgress) return; // Prevent multiple clicks
    		$$invalidate(1, likeInProgress = true);

    		try {
    			// Add timestamp to prevent caching
    			const timestamp = new Date().getTime();

    			const response = await fetch(`/api/menu/${item.id}/like?_=${timestamp}`, {
    				method: 'POST',
    				headers: {
    					'Accept': 'application/json',
    					'Content-Type': 'application/json',
    					'Cache-Control': 'no-cache, no-store, must-revalidate',
    					'Pragma': 'no-cache',
    					'Expires': '0'
    				}
    			});

    			if (!response.ok) {
    				throw new Error(`Failed to like item: ${response.statusText}`);
    			}

    			// Check for JSON content type
    			const contentType = response.headers.get('content-type');

    			if (!contentType || !contentType.includes('application/json')) {
    				const text = await response.text();
    				console.error('Server returned non-JSON response:', text);
    				throw new Error('Server returned invalid data format. Please try again later.');
    			}

    			const updatedItem = await response.json();

    			// Update the item with the new like count
    			$$invalidate(0, item.likes = updatedItem.likes, item);

    			// Show feedback message
    			$$invalidate(3, feedbackMessage = "Thank you for loving our " + item.name + "! 💕");

    			$$invalidate(4, showFeedback = true);

    			setTimeout(
    				() => {
    					$$invalidate(4, showFeedback = false);
    				},
    				3000
    			);

    			// Clear any error
    			$$invalidate(5, errorMessage = null);
    		} catch(error) {
    			console.error('Error liking item:', error);
    			$$invalidate(5, errorMessage = "Couldn't save your like. Please try again.");

    			setTimeout(
    				() => {
    					$$invalidate(5, errorMessage = null);
    				},
    				3000
    			);
    		} finally {
    			$$invalidate(1, likeInProgress = false);
    		}
    	}

    	// Function to dislike an item via API
    	async function handleDislike() {
    		if (dislikeInProgress) return; // Prevent multiple clicks
    		$$invalidate(2, dislikeInProgress = true);

    		try {
    			// Add timestamp to prevent caching
    			const timestamp = new Date().getTime();

    			const response = await fetch(`/api/menu/${item.id}/dislike?_=${timestamp}`, {
    				method: 'POST',
    				headers: {
    					'Accept': 'application/json',
    					'Content-Type': 'application/json',
    					'Cache-Control': 'no-cache, no-store, must-revalidate',
    					'Pragma': 'no-cache',
    					'Expires': '0'
    				}
    			});

    			if (!response.ok) {
    				throw new Error(`Failed to dislike item: ${response.statusText}`);
    			}

    			// Check for JSON content type
    			const contentType = response.headers.get('content-type');

    			if (!contentType || !contentType.includes('application/json')) {
    				const text = await response.text();
    				console.error('Server returned non-JSON response:', text);
    				throw new Error('Server returned invalid data format. Please try again later.');
    			}

    			const updatedItem = await response.json();

    			// Update the item with the new dislike count
    			$$invalidate(0, item.dislikes = updatedItem.dislikes, item);

    			// Show feedback message
    			$$invalidate(3, feedbackMessage = "We'll work to improve our " + item.name + "! 🙏");

    			$$invalidate(4, showFeedback = true);

    			setTimeout(
    				() => {
    					$$invalidate(4, showFeedback = false);
    				},
    				3000
    			);

    			// Clear any error
    			$$invalidate(5, errorMessage = null);
    		} catch(error) {
    			console.error('Error disliking item:', error);
    			$$invalidate(5, errorMessage = "Couldn't save your feedback. Please try again.");

    			setTimeout(
    				() => {
    					$$invalidate(5, errorMessage = null);
    				},
    				3000
    			);
    		} finally {
    			$$invalidate(2, dislikeInProgress = false);
    		}
    	}

    	$$self.$$.on_mount.push(function () {
    		if (item === undefined && !('item' in $$props || $$self.$$.bound[$$self.$$.props['item']])) {
    			console_1$2.warn("<MenuItem> was created without expected prop 'item'");
    		}
    	});

    	const writable_props = ['item'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$2.warn(`<MenuItem> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('item' in $$props) $$invalidate(0, item = $$props.item);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		item,
    		likeInProgress,
    		dislikeInProgress,
    		feedbackMessage,
    		showFeedback,
    		errorMessage,
    		determineItemIcon,
    		icon,
    		handleLike,
    		handleDislike
    	});

    	$$self.$inject_state = $$props => {
    		if ('item' in $$props) $$invalidate(0, item = $$props.item);
    		if ('likeInProgress' in $$props) $$invalidate(1, likeInProgress = $$props.likeInProgress);
    		if ('dislikeInProgress' in $$props) $$invalidate(2, dislikeInProgress = $$props.dislikeInProgress);
    		if ('feedbackMessage' in $$props) $$invalidate(3, feedbackMessage = $$props.feedbackMessage);
    		if ('showFeedback' in $$props) $$invalidate(4, showFeedback = $$props.showFeedback);
    		if ('errorMessage' in $$props) $$invalidate(5, errorMessage = $$props.errorMessage);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		item,
    		likeInProgress,
    		dislikeInProgress,
    		feedbackMessage,
    		showFeedback,
    		errorMessage,
    		icon,
    		handleLike,
    		handleDislike
    	];
    }

    class MenuItem extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, { item: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "MenuItem",
    			options,
    			id: create_fragment$8.name
    		});
    	}

    	get item() {
    		throw new Error_1$1("<MenuItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set item(value) {
    		throw new Error_1$1("<MenuItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\MenuCategory.svelte generated by Svelte v3.59.2 */
    const file$7 = "src\\components\\MenuCategory.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[5] = list[i];
    	return child_ctx;
    }

    // (50:6) {#if hasItems}
    function create_if_block_2$2(ctx) {
    	let span;
    	let t0_value = /*category*/ ctx[0].items.length + "";
    	let t0;
    	let t1;

    	let t2_value = (/*category*/ ctx[0].items.length === 1
    	? 'item'
    	: 'items') + "";

    	let t2;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t0 = text(t0_value);
    			t1 = space();
    			t2 = text(t2_value);
    			attr_dev(span, "class", "ml-3 px-2.5 py-1 bg-coffee-200 text-coffee-800 rounded-full text-xs font-medium");
    			add_location(span, file$7, 50, 8, 1873);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t0);
    			append_dev(span, t1);
    			append_dev(span, t2);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*category*/ 1 && t0_value !== (t0_value = /*category*/ ctx[0].items.length + "")) set_data_dev(t0, t0_value);

    			if (dirty & /*category*/ 1 && t2_value !== (t2_value = (/*category*/ ctx[0].items.length === 1
    			? 'item'
    			: 'items') + "")) set_data_dev(t2, t2_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$2.name,
    		type: "if",
    		source: "(50:6) {#if hasItems}",
    		ctx
    	});

    	return block;
    }

    // (70:2) {#if isExpanded}
    function create_if_block$6(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block_1$2, create_else_block$4];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*hasItems*/ ctx[2]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$6.name,
    		type: "if",
    		source: "(70:2) {#if isExpanded}",
    		ctx
    	});

    	return block;
    }

    // (81:4) {:else}
    function create_else_block$4(ctx) {
    	let div;
    	let svg;
    	let path;
    	let t0;
    	let p0;
    	let t2;
    	let p1;

    	const block = {
    		c: function create() {
    			div = element("div");
    			svg = svg_element("svg");
    			path = svg_element("path");
    			t0 = space();
    			p0 = element("p");
    			p0.textContent = "No items in this category yet.";
    			t2 = space();
    			p1 = element("p");
    			p1.textContent = "Check back soon for updates!";
    			attr_dev(path, "stroke-linecap", "round");
    			attr_dev(path, "stroke-linejoin", "round");
    			attr_dev(path, "stroke-width", "2");
    			attr_dev(path, "d", "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z");
    			add_location(path, file$7, 83, 10, 3436);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "class", "h-12 w-12 mx-auto text-coffee-300 mb-3");
    			attr_dev(svg, "fill", "none");
    			attr_dev(svg, "viewBox", "0 0 24 24");
    			attr_dev(svg, "stroke", "currentColor");
    			add_location(svg, file$7, 82, 8, 3284);
    			attr_dev(p0, "class", "text-coffee-600");
    			add_location(p0, file$7, 85, 8, 3594);
    			attr_dev(p1, "class", "text-coffee-500 text-sm mt-1");
    			add_location(p1, file$7, 86, 8, 3664);
    			attr_dev(div, "class", "bg-coffee-50 p-6 rounded-xl text-center");
    			add_location(div, file$7, 81, 6, 3222);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, svg);
    			append_dev(svg, path);
    			append_dev(div, t0);
    			append_dev(div, p0);
    			append_dev(div, t2);
    			append_dev(div, p1);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$4.name,
    		type: "else",
    		source: "(81:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (71:4) {#if hasItems}
    function create_if_block_1$2(ctx) {
    	let div;
    	let div_id_value;
    	let div_transition;
    	let current;
    	let each_value = /*category*/ ctx[0].items;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "id", div_id_value = "category-items-" + /*category*/ ctx[0].id);
    			attr_dev(div, "class", "grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 animate-fadeIn svelte-bsjfp6");
    			add_location(div, file$7, 71, 6, 2926);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(div, null);
    				}
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*category*/ 1) {
    				each_value = /*category*/ ctx[0].items;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}

    			if (!current || dirty & /*category*/ 1 && div_id_value !== (div_id_value = "category-items-" + /*category*/ ctx[0].id)) {
    				attr_dev(div, "id", div_id_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			add_render_callback(() => {
    				if (!current) return;
    				if (!div_transition) div_transition = create_bidirectional_transition(div, slide, { duration: 300 }, true);
    				div_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			if (!div_transition) div_transition = create_bidirectional_transition(div, slide, { duration: 300 }, false);
    			div_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    			if (detaching && div_transition) div_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$2.name,
    		type: "if",
    		source: "(71:4) {#if hasItems}",
    		ctx
    	});

    	return block;
    }

    // (77:8) {#each category.items as item}
    function create_each_block$2(ctx) {
    	let menuitem;
    	let current;

    	menuitem = new MenuItem({
    			props: { item: /*item*/ ctx[5] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(menuitem.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(menuitem, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const menuitem_changes = {};
    			if (dirty & /*category*/ 1) menuitem_changes.item = /*item*/ ctx[5];
    			menuitem.$set(menuitem_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(menuitem.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(menuitem.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(menuitem, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(77:8) {#each category.items as item}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$7(ctx) {
    	let section;
    	let div3;
    	let div1;
    	let div0;
    	let svg0;
    	let path0;
    	let path1;
    	let t0;
    	let h2;
    	let t1_value = /*category*/ ctx[0].name + "";
    	let t1;
    	let t2;
    	let t3;
    	let div2;
    	let span;
    	let t4_value = (/*isExpanded*/ ctx[1] ? 'Hide' : 'Show') + "";
    	let t4;
    	let t5;
    	let svg1;
    	let polyline;
    	let svg1_class_value;
    	let div3_aria_controls_value;
    	let t6;
    	let div4;
    	let t7;
    	let section_id_value;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block0 = /*hasItems*/ ctx[2] && create_if_block_2$2(ctx);
    	let if_block1 = /*isExpanded*/ ctx[1] && create_if_block$6(ctx);

    	const block = {
    		c: function create() {
    			section = element("section");
    			div3 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			svg0 = svg_element("svg");
    			path0 = svg_element("path");
    			path1 = svg_element("path");
    			t0 = space();
    			h2 = element("h2");
    			t1 = text(t1_value);
    			t2 = space();
    			if (if_block0) if_block0.c();
    			t3 = space();
    			div2 = element("div");
    			span = element("span");
    			t4 = text(t4_value);
    			t5 = space();
    			svg1 = svg_element("svg");
    			polyline = svg_element("polyline");
    			t6 = space();
    			div4 = element("div");
    			t7 = space();
    			if (if_block1) if_block1.c();
    			attr_dev(path0, "d", "M6 11l3.05-1.75c.47-.27 1.15-.21 1.5.13l5.03 5.03c.49.49.51 1.3.04 1.8l-3.75 3.75c-.48.48-1.28.48-1.76 0l-4.02-4.02C5.57 15.42 5.57 14.57 6 14l0 0z");
    			add_location(path0, file$7, 38, 10, 1291);
    			attr_dev(path1, "d", "M10 6l1.95-1.95c.49-.49 1.28-.49 1.77 0l4.02 4.02c.49.49.49 1.28 0 1.77l-2 2");
    			add_location(path1, file$7, 39, 10, 1467);
    			attr_dev(svg0, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg0, "viewBox", "0 0 24 24");
    			attr_dev(svg0, "fill", "none");
    			attr_dev(svg0, "stroke", "currentColor");
    			attr_dev(svg0, "stroke-width", "2");
    			attr_dev(svg0, "stroke-linecap", "round");
    			attr_dev(svg0, "stroke-linejoin", "round");
    			attr_dev(svg0, "class", "w-6 h-6 transform transition-transform duration-500 group-hover:rotate-45");
    			add_location(svg0, file$7, 37, 8, 1040);
    			attr_dev(div0, "class", "hidden sm:flex mr-3 text-coffee-500");
    			add_location(div0, file$7, 36, 6, 982);
    			attr_dev(h2, "class", "heading-serif text-2xl sm:text-3xl font-bold text-coffee-800 group-hover:text-coffee-600 transition-colors");
    			add_location(h2, file$7, 44, 6, 1649);
    			attr_dev(div1, "class", "flex items-center");
    			add_location(div1, file$7, 34, 4, 901);
    			attr_dev(span, "class", "mr-2 text-sm font-medium");
    			add_location(span, file$7, 58, 6, 2244);
    			attr_dev(polyline, "points", "6 9 12 15 18 9");
    			add_location(polyline, file$7, 60, 8, 2587);
    			attr_dev(svg1, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg1, "viewBox", "0 0 24 24");
    			attr_dev(svg1, "fill", "none");
    			attr_dev(svg1, "stroke", "currentColor");
    			attr_dev(svg1, "stroke-width", "2");
    			attr_dev(svg1, "stroke-linecap", "round");
    			attr_dev(svg1, "stroke-linejoin", "round");
    			attr_dev(svg1, "class", svg1_class_value = "w-5 h-5 transform transition-transform duration-300 " + (/*isExpanded*/ ctx[1] ? 'rotate-180' : ''));
    			add_location(svg1, file$7, 59, 6, 2327);
    			attr_dev(div2, "class", "flex items-center text-coffee-500 group-hover:text-coffee-700 transition-colors");
    			add_location(div2, file$7, 57, 4, 2144);
    			attr_dev(div3, "class", "group flex items-center justify-between cursor-pointer mb-6");
    			attr_dev(div3, "role", "button");
    			attr_dev(div3, "tabindex", "0");
    			attr_dev(div3, "aria-expanded", /*isExpanded*/ ctx[1]);
    			attr_dev(div3, "aria-controls", div3_aria_controls_value = "category-items-" + /*category*/ ctx[0].id);
    			add_location(div3, file$7, 25, 2, 639);
    			attr_dev(div4, "class", "h-px bg-gradient-to-r from-coffee-200 via-coffee-300 to-coffee-200 mb-6 opacity-70");
    			add_location(div4, file$7, 66, 2, 2715);
    			attr_dev(section, "id", section_id_value = /*category*/ ctx[0].id);
    			attr_dev(section, "class", "menu-category mb-10");
    			add_location(section, file$7, 23, 0, 529);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, div3);
    			append_dev(div3, div1);
    			append_dev(div1, div0);
    			append_dev(div0, svg0);
    			append_dev(svg0, path0);
    			append_dev(svg0, path1);
    			append_dev(div1, t0);
    			append_dev(div1, h2);
    			append_dev(h2, t1);
    			append_dev(div1, t2);
    			if (if_block0) if_block0.m(div1, null);
    			append_dev(div3, t3);
    			append_dev(div3, div2);
    			append_dev(div2, span);
    			append_dev(span, t4);
    			append_dev(div2, t5);
    			append_dev(div2, svg1);
    			append_dev(svg1, polyline);
    			append_dev(section, t6);
    			append_dev(section, div4);
    			append_dev(section, t7);
    			if (if_block1) if_block1.m(section, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(div3, "click", /*toggleExpanded*/ ctx[3], false, false, false, false),
    					listen_dev(div3, "keydown", /*handleKeyDown*/ ctx[4], false, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if ((!current || dirty & /*category*/ 1) && t1_value !== (t1_value = /*category*/ ctx[0].name + "")) set_data_dev(t1, t1_value);

    			if (/*hasItems*/ ctx[2]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_2$2(ctx);
    					if_block0.c();
    					if_block0.m(div1, null);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if ((!current || dirty & /*isExpanded*/ 2) && t4_value !== (t4_value = (/*isExpanded*/ ctx[1] ? 'Hide' : 'Show') + "")) set_data_dev(t4, t4_value);

    			if (!current || dirty & /*isExpanded*/ 2 && svg1_class_value !== (svg1_class_value = "w-5 h-5 transform transition-transform duration-300 " + (/*isExpanded*/ ctx[1] ? 'rotate-180' : ''))) {
    				attr_dev(svg1, "class", svg1_class_value);
    			}

    			if (!current || dirty & /*isExpanded*/ 2) {
    				attr_dev(div3, "aria-expanded", /*isExpanded*/ ctx[1]);
    			}

    			if (!current || dirty & /*category*/ 1 && div3_aria_controls_value !== (div3_aria_controls_value = "category-items-" + /*category*/ ctx[0].id)) {
    				attr_dev(div3, "aria-controls", div3_aria_controls_value);
    			}

    			if (/*isExpanded*/ ctx[1]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty & /*isExpanded*/ 2) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block$6(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(section, null);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}

    			if (!current || dirty & /*category*/ 1 && section_id_value !== (section_id_value = /*category*/ ctx[0].id)) {
    				attr_dev(section, "id", section_id_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block1);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block1);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let hasItems;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('MenuCategory', slots, []);
    	let { category } = $$props;
    	let isExpanded = true;

    	function toggleExpanded() {
    		$$invalidate(1, isExpanded = !isExpanded);
    	}

    	// Handle keyboard events for accessibility
    	function handleKeyDown(event) {
    		if (event.key === 'Enter' || event.key === ' ') {
    			event.preventDefault();
    			toggleExpanded();
    		}
    	}

    	$$self.$$.on_mount.push(function () {
    		if (category === undefined && !('category' in $$props || $$self.$$.bound[$$self.$$.props['category']])) {
    			console.warn("<MenuCategory> was created without expected prop 'category'");
    		}
    	});

    	const writable_props = ['category'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<MenuCategory> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('category' in $$props) $$invalidate(0, category = $$props.category);
    	};

    	$$self.$capture_state = () => ({
    		MenuItem,
    		slide,
    		category,
    		isExpanded,
    		toggleExpanded,
    		handleKeyDown,
    		hasItems
    	});

    	$$self.$inject_state = $$props => {
    		if ('category' in $$props) $$invalidate(0, category = $$props.category);
    		if ('isExpanded' in $$props) $$invalidate(1, isExpanded = $$props.isExpanded);
    		if ('hasItems' in $$props) $$invalidate(2, hasItems = $$props.hasItems);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*category*/ 1) {
    			// Check if the category has items
    			$$invalidate(2, hasItems = category.items && category.items.length > 0);
    		}
    	};

    	return [category, isExpanded, hasItems, toggleExpanded, handleKeyDown];
    }

    class MenuCategory extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, { category: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "MenuCategory",
    			options,
    			id: create_fragment$7.name
    		});
    	}

    	get category() {
    		throw new Error("<MenuCategory>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set category(value) {
    		throw new Error("<MenuCategory>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\Search.svelte generated by Svelte v3.59.2 */

    const file$6 = "src\\components\\Search.svelte";

    // (52:6) {#if searchQuery}
    function create_if_block$5(ctx) {
    	let button;
    	let div;
    	let svg;
    	let line0;
    	let line1;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			div = element("div");
    			svg = svg_element("svg");
    			line0 = svg_element("line");
    			line1 = svg_element("line");
    			attr_dev(line0, "x1", "18");
    			attr_dev(line0, "y1", "6");
    			attr_dev(line0, "x2", "6");
    			attr_dev(line0, "y2", "18");
    			add_location(line0, file$6, 59, 14, 2370);
    			attr_dev(line1, "x1", "6");
    			attr_dev(line1, "y1", "6");
    			attr_dev(line1, "x2", "18");
    			attr_dev(line1, "y2", "18");
    			add_location(line1, file$6, 60, 14, 2428);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "width", "18");
    			attr_dev(svg, "height", "18");
    			attr_dev(svg, "viewBox", "0 0 24 24");
    			attr_dev(svg, "fill", "none");
    			attr_dev(svg, "stroke", "currentColor");
    			attr_dev(svg, "stroke-width", "2");
    			attr_dev(svg, "stroke-linecap", "round");
    			attr_dev(svg, "stroke-linejoin", "round");
    			add_location(svg, file$6, 58, 12, 2174);
    			attr_dev(div, "class", "p-1 rounded-full hover:bg-coffee-100");
    			add_location(div, file$6, 57, 10, 2111);
    			attr_dev(button, "class", "absolute inset-y-0 right-0 pr-4 flex items-center text-coffee-400 hover:text-coffee-700 transition-colors");
    			attr_dev(button, "aria-label", "Clear search");
    			add_location(button, file$6, 52, 8, 1889);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			append_dev(button, div);
    			append_dev(div, svg);
    			append_dev(svg, line0);
    			append_dev(svg, line1);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*clearSearch*/ ctx[3], false, false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$5.name,
    		type: "if",
    		source: "(52:6) {#if searchQuery}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$6(ctx) {
    	let div3;
    	let div2;
    	let label;
    	let t1;
    	let div1;
    	let div0;
    	let svg;
    	let circle;
    	let line;
    	let svg_class_value;
    	let t2;
    	let input;
    	let t3;
    	let div1_class_value;
    	let t4;
    	let p;
    	let mounted;
    	let dispose;
    	let if_block = /*searchQuery*/ ctx[0] && create_if_block$5(ctx);

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			div2 = element("div");
    			label = element("label");
    			label.textContent = "Find your favorite item";
    			t1 = space();
    			div1 = element("div");
    			div0 = element("div");
    			svg = svg_element("svg");
    			circle = svg_element("circle");
    			line = svg_element("line");
    			t2 = space();
    			input = element("input");
    			t3 = space();
    			if (if_block) if_block.c();
    			t4 = space();
    			p = element("p");
    			p.textContent = "Type the name of an item or ingredient to find it quickly";
    			attr_dev(label, "for", "menu-search");
    			attr_dev(label, "class", "block text-coffee-700 font-medium mb-2 text-sm");
    			add_location(label, file$6, 24, 4, 438);
    			attr_dev(circle, "cx", "11");
    			attr_dev(circle, "cy", "11");
    			attr_dev(circle, "r", "8");
    			add_location(circle, file$6, 31, 10, 1075);
    			attr_dev(line, "x1", "21");
    			attr_dev(line, "y1", "21");
    			attr_dev(line, "x2", "16.65");
    			attr_dev(line, "y2", "16.65");
    			add_location(line, file$6, 32, 10, 1125);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "width", "20");
    			attr_dev(svg, "height", "20");
    			attr_dev(svg, "viewBox", "0 0 24 24");
    			attr_dev(svg, "fill", "none");
    			attr_dev(svg, "stroke", "currentColor");
    			attr_dev(svg, "stroke-width", "2");
    			attr_dev(svg, "stroke-linecap", "round");
    			attr_dev(svg, "stroke-linejoin", "round");
    			attr_dev(svg, "class", svg_class_value = "text-coffee-400 " + (/*isFocused*/ ctx[1] ? 'text-coffee-600' : ''));
    			add_location(svg, file$6, 30, 8, 822);
    			attr_dev(div0, "class", "absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none");
    			add_location(div0, file$6, 29, 6, 731);
    			attr_dev(input, "id", "menu-search");
    			attr_dev(input, "type", "text");
    			attr_dev(input, "placeholder", "Search for coffee, pastries, sandwiches...");
    			attr_dev(input, "class", "block w-full bg-white border-2 border-coffee-200 rounded-xl py-3 pl-12 pr-12 placeholder-coffee-400 focus:outline-none focus:ring-2 focus:ring-cream-500 focus:border-cream-400 focus:shadow-soft text-coffee-800 font-medium transition-all duration-300");
    			add_location(input, file$6, 37, 6, 1246);
    			attr_dev(div1, "class", div1_class_value = "relative transition-all duration-300 " + (/*isFocused*/ ctx[1] ? 'scale-[1.02]' : ''));
    			add_location(div1, file$6, 27, 4, 613);
    			attr_dev(p, "class", "mt-2 text-xs text-coffee-500 text-center");
    			add_location(p, file$6, 68, 4, 2594);
    			attr_dev(div2, "class", "relative max-w-2xl mx-auto");
    			add_location(div2, file$6, 22, 2, 349);
    			attr_dev(div3, "class", "w-full mb-8");
    			add_location(div3, file$6, 21, 0, 321);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div2);
    			append_dev(div2, label);
    			append_dev(div2, t1);
    			append_dev(div2, div1);
    			append_dev(div1, div0);
    			append_dev(div0, svg);
    			append_dev(svg, circle);
    			append_dev(svg, line);
    			append_dev(div1, t2);
    			append_dev(div1, input);
    			set_input_value(input, /*searchQuery*/ ctx[0]);
    			append_dev(div1, t3);
    			if (if_block) if_block.m(div1, null);
    			append_dev(div2, t4);
    			append_dev(div2, p);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "input", /*input_input_handler*/ ctx[6]),
    					listen_dev(input, "input", /*handleInput*/ ctx[2], false, false, false, false),
    					listen_dev(input, "focus", /*handleFocus*/ ctx[4], false, false, false, false),
    					listen_dev(input, "blur", /*handleBlur*/ ctx[5], false, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*isFocused*/ 2 && svg_class_value !== (svg_class_value = "text-coffee-400 " + (/*isFocused*/ ctx[1] ? 'text-coffee-600' : ''))) {
    				attr_dev(svg, "class", svg_class_value);
    			}

    			if (dirty & /*searchQuery*/ 1 && input.value !== /*searchQuery*/ ctx[0]) {
    				set_input_value(input, /*searchQuery*/ ctx[0]);
    			}

    			if (/*searchQuery*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$5(ctx);
    					if_block.c();
    					if_block.m(div1, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty & /*isFocused*/ 2 && div1_class_value !== (div1_class_value = "relative transition-all duration-300 " + (/*isFocused*/ ctx[1] ? 'scale-[1.02]' : ''))) {
    				attr_dev(div1, "class", div1_class_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    			if (if_block) if_block.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Search', slots, []);
    	let { searchQuery = '' } = $$props;
    	let isFocused = false;

    	function handleInput(event) {
    		$$invalidate(0, searchQuery = event.target.value);
    	}

    	function clearSearch() {
    		$$invalidate(0, searchQuery = '');
    	}

    	function handleFocus() {
    		$$invalidate(1, isFocused = true);
    	}

    	function handleBlur() {
    		$$invalidate(1, isFocused = false);
    	}

    	const writable_props = ['searchQuery'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Search> was created with unknown prop '${key}'`);
    	});

    	function input_input_handler() {
    		searchQuery = this.value;
    		$$invalidate(0, searchQuery);
    	}

    	$$self.$$set = $$props => {
    		if ('searchQuery' in $$props) $$invalidate(0, searchQuery = $$props.searchQuery);
    	};

    	$$self.$capture_state = () => ({
    		searchQuery,
    		isFocused,
    		handleInput,
    		clearSearch,
    		handleFocus,
    		handleBlur
    	});

    	$$self.$inject_state = $$props => {
    		if ('searchQuery' in $$props) $$invalidate(0, searchQuery = $$props.searchQuery);
    		if ('isFocused' in $$props) $$invalidate(1, isFocused = $$props.isFocused);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		searchQuery,
    		isFocused,
    		handleInput,
    		clearSearch,
    		handleFocus,
    		handleBlur,
    		input_input_handler
    	];
    }

    class Search extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, { searchQuery: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Search",
    			options,
    			id: create_fragment$6.name
    		});
    	}

    	get searchQuery() {
    		throw new Error("<Search>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set searchQuery(value) {
    		throw new Error("<Search>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\Footer.svelte generated by Svelte v3.59.2 */

    const file$5 = "src\\components\\Footer.svelte";

    function create_fragment$5(ctx) {
    	let footer;
    	let div0;
    	let t0;
    	let div1;
    	let svg0;
    	let path0;
    	let path1;
    	let path2;
    	let t1;
    	let div12;
    	let div8;
    	let div4;
    	let div2;
    	let svg1;
    	let path3;
    	let path4;
    	let t2;
    	let h30;
    	let t4;
    	let p0;
    	let t6;
    	let div3;
    	let a0;
    	let span0;
    	let t8;
    	let svg2;
    	let rect;
    	let path5;
    	let line;
    	let t9;
    	let a1;
    	let span1;
    	let t11;
    	let svg3;
    	let path6;
    	let t12;
    	let a2;
    	let span2;
    	let t14;
    	let svg4;
    	let path7;
    	let t15;
    	let div6;
    	let h31;
    	let t17;
    	let ul0;
    	let li0;
    	let span3;
    	let svg5;
    	let circle0;
    	let polyline0;
    	let t18;
    	let span5;
    	let t19;
    	let span4;
    	let t21;
    	let li1;
    	let span6;
    	let svg6;
    	let circle1;
    	let polyline1;
    	let t22;
    	let span8;
    	let t23;
    	let span7;
    	let t25;
    	let li2;
    	let span9;
    	let svg7;
    	let circle2;
    	let polyline2;
    	let t26;
    	let span11;
    	let t27;
    	let span10;
    	let t29;
    	let div5;
    	let p1;
    	let t31;
    	let div7;
    	let h32;
    	let t33;
    	let ul1;
    	let li3;
    	let span12;
    	let svg8;
    	let path8;
    	let circle3;
    	let t34;
    	let span13;
    	let t35;
    	let br;
    	let t36;
    	let t37;
    	let li4;
    	let span14;
    	let svg9;
    	let path9;
    	let t38;
    	let span15;
    	let t40;
    	let li5;
    	let span16;
    	let svg10;
    	let path10;
    	let polyline3;
    	let t41;
    	let a3;
    	let t43;
    	let div11;
    	let div10;
    	let p2;
    	let t47;
    	let div9;
    	let p3;

    	const block = {
    		c: function create() {
    			footer = element("footer");
    			div0 = element("div");
    			t0 = space();
    			div1 = element("div");
    			svg0 = svg_element("svg");
    			path0 = svg_element("path");
    			path1 = svg_element("path");
    			path2 = svg_element("path");
    			t1 = space();
    			div12 = element("div");
    			div8 = element("div");
    			div4 = element("div");
    			div2 = element("div");
    			svg1 = svg_element("svg");
    			path3 = svg_element("path");
    			path4 = svg_element("path");
    			t2 = space();
    			h30 = element("h3");
    			h30.textContent = "Yoya Coffee";
    			t4 = space();
    			p0 = element("p");
    			p0.textContent = "Serving premium coffee and delicious food since 2015. Our mission is to create a warm, welcoming place for our community to gather, connect, and enjoy exceptional coffee experiences.";
    			t6 = space();
    			div3 = element("div");
    			a0 = element("a");
    			span0 = element("span");
    			span0.textContent = "Instagram";
    			t8 = space();
    			svg2 = svg_element("svg");
    			rect = svg_element("rect");
    			path5 = svg_element("path");
    			line = svg_element("line");
    			t9 = space();
    			a1 = element("a");
    			span1 = element("span");
    			span1.textContent = "Facebook";
    			t11 = space();
    			svg3 = svg_element("svg");
    			path6 = svg_element("path");
    			t12 = space();
    			a2 = element("a");
    			span2 = element("span");
    			span2.textContent = "Twitter";
    			t14 = space();
    			svg4 = svg_element("svg");
    			path7 = svg_element("path");
    			t15 = space();
    			div6 = element("div");
    			h31 = element("h3");
    			h31.textContent = "Hours";
    			t17 = space();
    			ul0 = element("ul");
    			li0 = element("li");
    			span3 = element("span");
    			svg5 = svg_element("svg");
    			circle0 = svg_element("circle");
    			polyline0 = svg_element("polyline");
    			t18 = space();
    			span5 = element("span");
    			t19 = text("Monday - Friday: ");
    			span4 = element("span");
    			span4.textContent = "6:30 AM - 8:00 PM";
    			t21 = space();
    			li1 = element("li");
    			span6 = element("span");
    			svg6 = svg_element("svg");
    			circle1 = svg_element("circle");
    			polyline1 = svg_element("polyline");
    			t22 = space();
    			span8 = element("span");
    			t23 = text("Saturday: ");
    			span7 = element("span");
    			span7.textContent = "7:00 AM - 8:00 PM";
    			t25 = space();
    			li2 = element("li");
    			span9 = element("span");
    			svg7 = svg_element("svg");
    			circle2 = svg_element("circle");
    			polyline2 = svg_element("polyline");
    			t26 = space();
    			span11 = element("span");
    			t27 = text("Sunday: ");
    			span10 = element("span");
    			span10.textContent = "8:00 AM - 6:00 PM";
    			t29 = space();
    			div5 = element("div");
    			p1 = element("p");
    			p1.textContent = "Holiday hours may vary. Check our social media for updates!";
    			t31 = space();
    			div7 = element("div");
    			h32 = element("h3");
    			h32.textContent = "Contact";
    			t33 = space();
    			ul1 = element("ul");
    			li3 = element("li");
    			span12 = element("span");
    			svg8 = svg_element("svg");
    			path8 = svg_element("path");
    			circle3 = svg_element("circle");
    			t34 = space();
    			span13 = element("span");
    			t35 = text("123 Coffee Street");
    			br = element("br");
    			t36 = text("Seattle, WA 98101");
    			t37 = space();
    			li4 = element("li");
    			span14 = element("span");
    			svg9 = svg_element("svg");
    			path9 = svg_element("path");
    			t38 = space();
    			span15 = element("span");
    			span15.textContent = "(555) 123-4567";
    			t40 = space();
    			li5 = element("li");
    			span16 = element("span");
    			svg10 = svg_element("svg");
    			path10 = svg_element("path");
    			polyline3 = svg_element("polyline");
    			t41 = space();
    			a3 = element("a");
    			a3.textContent = "info@yoyacoffee.com";
    			t43 = space();
    			div11 = element("div");
    			div10 = element("div");
    			p2 = element("p");
    			p2.textContent = `© ${new Date().getFullYear()} Yoya Coffee. All rights reserved.`;
    			t47 = space();
    			div9 = element("div");
    			p3 = element("p");
    			p3.textContent = "Designed by Michael. T";
    			attr_dev(div0, "class", "absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-cream-400 to-transparent opacity-60");
    			add_location(div0, file$5, 2, 2, 101);
    			attr_dev(path0, "d", "M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z");
    			add_location(path0, file$5, 7, 6, 491);
    			attr_dev(path1, "d", "M6 1v3M10 1v3M14 1v3");
    			add_location(path1, file$5, 8, 6, 551);
    			attr_dev(path2, "d", "M18 8h1a4 4 0 010 8h-1");
    			add_location(path2, file$5, 9, 6, 591);
    			attr_dev(svg0, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg0, "width", "80");
    			attr_dev(svg0, "height", "80");
    			attr_dev(svg0, "viewBox", "0 0 24 24");
    			attr_dev(svg0, "fill", "currentColor");
    			attr_dev(svg0, "stroke", "none");
    			add_location(svg0, file$5, 6, 4, 367);
    			attr_dev(div1, "class", "absolute right-4 -top-10 text-coffee-800 opacity-10 hidden lg:block");
    			add_location(div1, file$5, 5, 2, 281);
    			attr_dev(path3, "d", "M18 8h1a4 4 0 010 8h-1M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z");
    			add_location(path3, file$5, 20, 12, 1154);
    			attr_dev(path4, "d", "M6 1v3M10 1v3M14 1v3");
    			add_location(path4, file$5, 21, 12, 1242);
    			attr_dev(svg1, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg1, "width", "32");
    			attr_dev(svg1, "height", "32");
    			attr_dev(svg1, "viewBox", "0 0 24 24");
    			attr_dev(svg1, "fill", "none");
    			attr_dev(svg1, "stroke", "currentColor");
    			attr_dev(svg1, "stroke-width", "2");
    			attr_dev(svg1, "stroke-linecap", "round");
    			attr_dev(svg1, "stroke-linejoin", "round");
    			attr_dev(svg1, "class", "text-cream-300 mr-3");
    			add_location(svg1, file$5, 19, 10, 932);
    			attr_dev(h30, "class", "heading-serif text-2xl font-bold text-cream-100");
    			add_location(h30, file$5, 23, 10, 1303);
    			attr_dev(div2, "class", "flex items-center mb-4");
    			add_location(div2, file$5, 18, 8, 885);
    			attr_dev(p0, "class", "text-coffee-200 text-sm leading-relaxed mb-6 max-w-md");
    			add_location(p0, file$5, 25, 8, 1403);
    			attr_dev(span0, "class", "sr-only");
    			add_location(span0, file$5, 32, 12, 1915);
    			attr_dev(rect, "x", "2");
    			attr_dev(rect, "y", "2");
    			attr_dev(rect, "width", "20");
    			attr_dev(rect, "height", "20");
    			attr_dev(rect, "rx", "5");
    			attr_dev(rect, "ry", "5");
    			add_location(rect, file$5, 34, 14, 2185);
    			attr_dev(path5, "d", "M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z");
    			add_location(path5, file$5, 35, 14, 2262);
    			attr_dev(line, "x1", "17.5");
    			attr_dev(line, "y1", "6.5");
    			attr_dev(line, "x2", "17.51");
    			attr_dev(line, "y2", "6.5");
    			add_location(line, file$5, 36, 14, 2338);
    			attr_dev(svg2, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg2, "width", "18");
    			attr_dev(svg2, "height", "18");
    			attr_dev(svg2, "viewBox", "0 0 24 24");
    			attr_dev(svg2, "fill", "none");
    			attr_dev(svg2, "stroke", "currentColor");
    			attr_dev(svg2, "stroke-width", "2");
    			attr_dev(svg2, "stroke-linecap", "round");
    			attr_dev(svg2, "stroke-linejoin", "round");
    			attr_dev(svg2, "class", "text-cream-200");
    			add_location(svg2, file$5, 33, 12, 1966);
    			attr_dev(a0, "href", "/#instagram");
    			attr_dev(a0, "class", "w-9 h-9 rounded-full bg-coffee-800 hover:bg-coffee-700 flex items-center justify-center transition-colors");
    			add_location(a0, file$5, 31, 10, 1766);
    			attr_dev(span1, "class", "sr-only");
    			add_location(span1, file$5, 40, 12, 2583);
    			attr_dev(path6, "d", "M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z");
    			add_location(path6, file$5, 42, 14, 2852);
    			attr_dev(svg3, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg3, "width", "18");
    			attr_dev(svg3, "height", "18");
    			attr_dev(svg3, "viewBox", "0 0 24 24");
    			attr_dev(svg3, "fill", "none");
    			attr_dev(svg3, "stroke", "currentColor");
    			attr_dev(svg3, "stroke-width", "2");
    			attr_dev(svg3, "stroke-linecap", "round");
    			attr_dev(svg3, "stroke-linejoin", "round");
    			attr_dev(svg3, "class", "text-cream-200");
    			add_location(svg3, file$5, 41, 12, 2633);
    			attr_dev(a1, "href", "/#facebook");
    			attr_dev(a1, "class", "w-9 h-9 rounded-full bg-coffee-800 hover:bg-coffee-700 flex items-center justify-center transition-colors");
    			add_location(a1, file$5, 39, 10, 2435);
    			attr_dev(span2, "class", "sr-only");
    			add_location(span2, file$5, 46, 12, 3124);
    			attr_dev(path7, "d", "M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5 0-.28-.03-.56-.08-.83A7.72 7.72 0 0023 3z");
    			add_location(path7, file$5, 48, 14, 3392);
    			attr_dev(svg4, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg4, "width", "18");
    			attr_dev(svg4, "height", "18");
    			attr_dev(svg4, "viewBox", "0 0 24 24");
    			attr_dev(svg4, "fill", "none");
    			attr_dev(svg4, "stroke", "currentColor");
    			attr_dev(svg4, "stroke-width", "2");
    			attr_dev(svg4, "stroke-linecap", "round");
    			attr_dev(svg4, "stroke-linejoin", "round");
    			attr_dev(svg4, "class", "text-cream-200");
    			add_location(svg4, file$5, 47, 12, 3173);
    			attr_dev(a2, "href", "/#twitter");
    			attr_dev(a2, "class", "w-9 h-9 rounded-full bg-coffee-800 hover:bg-coffee-700 flex items-center justify-center transition-colors");
    			add_location(a2, file$5, 45, 10, 2977);
    			attr_dev(div3, "class", "flex space-x-4 mt-6");
    			add_location(div3, file$5, 30, 8, 1722);
    			attr_dev(div4, "class", "lg:col-span-2");
    			add_location(div4, file$5, 17, 6, 849);
    			attr_dev(h31, "class", "heading-serif text-lg font-semibold mb-5 text-cream-100");
    			add_location(h31, file$5, 56, 8, 3693);
    			attr_dev(circle0, "cx", "12");
    			attr_dev(circle0, "cy", "12");
    			attr_dev(circle0, "r", "10");
    			add_location(circle0, file$5, 61, 16, 4127);
    			attr_dev(polyline0, "points", "12 6 12 12 16 14");
    			add_location(polyline0, file$5, 62, 16, 4184);
    			attr_dev(svg5, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg5, "width", "16");
    			attr_dev(svg5, "height", "16");
    			attr_dev(svg5, "viewBox", "0 0 24 24");
    			attr_dev(svg5, "fill", "none");
    			attr_dev(svg5, "stroke", "currentColor");
    			attr_dev(svg5, "stroke-width", "2");
    			attr_dev(svg5, "stroke-linecap", "round");
    			attr_dev(svg5, "stroke-linejoin", "round");
    			add_location(svg5, file$5, 60, 14, 3929);
    			attr_dev(span3, "class", "text-cream-400 mr-2");
    			add_location(span3, file$5, 59, 12, 3880);
    			attr_dev(span4, "class", "text-cream-300");
    			add_location(span4, file$5, 65, 35, 4308);
    			add_location(span5, file$5, 65, 12, 4285);
    			attr_dev(li0, "class", "flex items-center");
    			add_location(li0, file$5, 58, 10, 3837);
    			attr_dev(circle1, "cx", "12");
    			attr_dev(circle1, "cy", "12");
    			attr_dev(circle1, "r", "10");
    			add_location(circle1, file$5, 70, 16, 4685);
    			attr_dev(polyline1, "points", "12 6 12 12 16 14");
    			add_location(polyline1, file$5, 71, 16, 4742);
    			attr_dev(svg6, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg6, "width", "16");
    			attr_dev(svg6, "height", "16");
    			attr_dev(svg6, "viewBox", "0 0 24 24");
    			attr_dev(svg6, "fill", "none");
    			attr_dev(svg6, "stroke", "currentColor");
    			attr_dev(svg6, "stroke-width", "2");
    			attr_dev(svg6, "stroke-linecap", "round");
    			attr_dev(svg6, "stroke-linejoin", "round");
    			add_location(svg6, file$5, 69, 14, 4487);
    			attr_dev(span6, "class", "text-cream-400 mr-2");
    			add_location(span6, file$5, 68, 12, 4438);
    			attr_dev(span7, "class", "text-cream-300");
    			add_location(span7, file$5, 74, 28, 4859);
    			add_location(span8, file$5, 74, 12, 4843);
    			attr_dev(li1, "class", "flex items-center");
    			add_location(li1, file$5, 67, 10, 4395);
    			attr_dev(circle2, "cx", "12");
    			attr_dev(circle2, "cy", "12");
    			attr_dev(circle2, "r", "10");
    			add_location(circle2, file$5, 79, 16, 5236);
    			attr_dev(polyline2, "points", "12 6 12 12 16 14");
    			add_location(polyline2, file$5, 80, 16, 5293);
    			attr_dev(svg7, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg7, "width", "16");
    			attr_dev(svg7, "height", "16");
    			attr_dev(svg7, "viewBox", "0 0 24 24");
    			attr_dev(svg7, "fill", "none");
    			attr_dev(svg7, "stroke", "currentColor");
    			attr_dev(svg7, "stroke-width", "2");
    			attr_dev(svg7, "stroke-linecap", "round");
    			attr_dev(svg7, "stroke-linejoin", "round");
    			add_location(svg7, file$5, 78, 14, 5038);
    			attr_dev(span9, "class", "text-cream-400 mr-2");
    			add_location(span9, file$5, 77, 12, 4989);
    			attr_dev(span10, "class", "text-cream-300");
    			add_location(span10, file$5, 83, 26, 5408);
    			add_location(span11, file$5, 83, 12, 5394);
    			attr_dev(li2, "class", "flex items-center");
    			add_location(li2, file$5, 76, 10, 4946);
    			attr_dev(ul0, "class", "text-sm space-y-3 text-coffee-100");
    			add_location(ul0, file$5, 57, 8, 3780);
    			attr_dev(p1, "class", "text-sm text-cream-200 italic");
    			add_location(p1, file$5, 88, 10, 5574);
    			attr_dev(div5, "class", "mt-6 p-3 bg-coffee-800 rounded-lg");
    			add_location(div5, file$5, 87, 8, 5516);
    			add_location(div6, file$5, 55, 6, 3679);
    			attr_dev(h32, "class", "heading-serif text-lg font-semibold mb-5 text-cream-100");
    			add_location(h32, file$5, 96, 8, 5789);
    			attr_dev(path8, "d", "M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z");
    			add_location(path8, file$5, 101, 16, 6229);
    			attr_dev(circle3, "cx", "12");
    			attr_dev(circle3, "cy", "10");
    			attr_dev(circle3, "r", "3");
    			add_location(circle3, file$5, 102, 16, 6310);
    			attr_dev(svg8, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg8, "width", "16");
    			attr_dev(svg8, "height", "16");
    			attr_dev(svg8, "viewBox", "0 0 24 24");
    			attr_dev(svg8, "fill", "none");
    			attr_dev(svg8, "stroke", "currentColor");
    			attr_dev(svg8, "stroke-width", "2");
    			attr_dev(svg8, "stroke-linecap", "round");
    			attr_dev(svg8, "stroke-linejoin", "round");
    			add_location(svg8, file$5, 100, 14, 6031);
    			attr_dev(span12, "class", "text-cream-400 mr-2 mt-1");
    			add_location(span12, file$5, 99, 12, 5977);
    			add_location(br, file$5, 105, 35, 6426);
    			add_location(span13, file$5, 105, 12, 6403);
    			attr_dev(li3, "class", "flex items-start");
    			add_location(li3, file$5, 98, 10, 5935);
    			attr_dev(path9, "d", "M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z");
    			add_location(path9, file$5, 110, 16, 6773);
    			attr_dev(svg9, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg9, "width", "16");
    			attr_dev(svg9, "height", "16");
    			attr_dev(svg9, "viewBox", "0 0 24 24");
    			attr_dev(svg9, "fill", "none");
    			attr_dev(svg9, "stroke", "currentColor");
    			attr_dev(svg9, "stroke-width", "2");
    			attr_dev(svg9, "stroke-linecap", "round");
    			attr_dev(svg9, "stroke-linejoin", "round");
    			add_location(svg9, file$5, 109, 14, 6575);
    			attr_dev(span14, "class", "text-cream-400 mr-2");
    			add_location(span14, file$5, 108, 12, 6526);
    			add_location(span15, file$5, 113, 12, 7111);
    			attr_dev(li4, "class", "flex items-center");
    			add_location(li4, file$5, 107, 10, 6483);
    			attr_dev(path10, "d", "M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z");
    			add_location(path10, file$5, 118, 16, 7455);
    			attr_dev(polyline3, "points", "22,6 12,13 2,6");
    			add_location(polyline3, file$5, 119, 16, 7565);
    			attr_dev(svg10, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg10, "width", "16");
    			attr_dev(svg10, "height", "16");
    			attr_dev(svg10, "viewBox", "0 0 24 24");
    			attr_dev(svg10, "fill", "none");
    			attr_dev(svg10, "stroke", "currentColor");
    			attr_dev(svg10, "stroke-width", "2");
    			attr_dev(svg10, "stroke-linecap", "round");
    			attr_dev(svg10, "stroke-linejoin", "round");
    			add_location(svg10, file$5, 117, 14, 7257);
    			attr_dev(span16, "class", "text-cream-400 mr-2");
    			add_location(span16, file$5, 116, 12, 7208);
    			attr_dev(a3, "href", "mailto:info@yoyacoffee.com");
    			attr_dev(a3, "class", "text-cream-300 hover:text-cream-100 underline");
    			add_location(a3, file$5, 122, 12, 7664);
    			attr_dev(li5, "class", "flex items-center");
    			add_location(li5, file$5, 115, 10, 7165);
    			attr_dev(ul1, "class", "text-sm space-y-3 text-coffee-100");
    			add_location(ul1, file$5, 97, 8, 5878);
    			add_location(div7, file$5, 95, 6, 5775);
    			attr_dev(div8, "class", "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10");
    			add_location(div8, file$5, 15, 4, 746);
    			attr_dev(p2, "class", "text-coffee-300 text-sm");
    			add_location(p2, file$5, 133, 8, 8072);
    			attr_dev(p3, "class", "text-coffee-300 text-sm italic");
    			add_location(p3, file$5, 137, 10, 8266);
    			attr_dev(div9, "class", "mt-4 md:mt-0");
    			add_location(div9, file$5, 136, 8, 8229);
    			attr_dev(div10, "class", "flex flex-col md:flex-row justify-between items-center");
    			add_location(div10, file$5, 132, 6, 7995);
    			attr_dev(div11, "class", "mt-10 pt-6 border-t border-coffee-800");
    			add_location(div11, file$5, 131, 4, 7937);
    			attr_dev(div12, "class", "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12");
    			add_location(div12, file$5, 14, 2, 683);
    			attr_dev(footer, "class", "bg-coffee-900 text-white mt-16 relative");
    			add_location(footer, file$5, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, footer, anchor);
    			append_dev(footer, div0);
    			append_dev(footer, t0);
    			append_dev(footer, div1);
    			append_dev(div1, svg0);
    			append_dev(svg0, path0);
    			append_dev(svg0, path1);
    			append_dev(svg0, path2);
    			append_dev(footer, t1);
    			append_dev(footer, div12);
    			append_dev(div12, div8);
    			append_dev(div8, div4);
    			append_dev(div4, div2);
    			append_dev(div2, svg1);
    			append_dev(svg1, path3);
    			append_dev(svg1, path4);
    			append_dev(div2, t2);
    			append_dev(div2, h30);
    			append_dev(div4, t4);
    			append_dev(div4, p0);
    			append_dev(div4, t6);
    			append_dev(div4, div3);
    			append_dev(div3, a0);
    			append_dev(a0, span0);
    			append_dev(a0, t8);
    			append_dev(a0, svg2);
    			append_dev(svg2, rect);
    			append_dev(svg2, path5);
    			append_dev(svg2, line);
    			append_dev(div3, t9);
    			append_dev(div3, a1);
    			append_dev(a1, span1);
    			append_dev(a1, t11);
    			append_dev(a1, svg3);
    			append_dev(svg3, path6);
    			append_dev(div3, t12);
    			append_dev(div3, a2);
    			append_dev(a2, span2);
    			append_dev(a2, t14);
    			append_dev(a2, svg4);
    			append_dev(svg4, path7);
    			append_dev(div8, t15);
    			append_dev(div8, div6);
    			append_dev(div6, h31);
    			append_dev(div6, t17);
    			append_dev(div6, ul0);
    			append_dev(ul0, li0);
    			append_dev(li0, span3);
    			append_dev(span3, svg5);
    			append_dev(svg5, circle0);
    			append_dev(svg5, polyline0);
    			append_dev(li0, t18);
    			append_dev(li0, span5);
    			append_dev(span5, t19);
    			append_dev(span5, span4);
    			append_dev(ul0, t21);
    			append_dev(ul0, li1);
    			append_dev(li1, span6);
    			append_dev(span6, svg6);
    			append_dev(svg6, circle1);
    			append_dev(svg6, polyline1);
    			append_dev(li1, t22);
    			append_dev(li1, span8);
    			append_dev(span8, t23);
    			append_dev(span8, span7);
    			append_dev(ul0, t25);
    			append_dev(ul0, li2);
    			append_dev(li2, span9);
    			append_dev(span9, svg7);
    			append_dev(svg7, circle2);
    			append_dev(svg7, polyline2);
    			append_dev(li2, t26);
    			append_dev(li2, span11);
    			append_dev(span11, t27);
    			append_dev(span11, span10);
    			append_dev(div6, t29);
    			append_dev(div6, div5);
    			append_dev(div5, p1);
    			append_dev(div8, t31);
    			append_dev(div8, div7);
    			append_dev(div7, h32);
    			append_dev(div7, t33);
    			append_dev(div7, ul1);
    			append_dev(ul1, li3);
    			append_dev(li3, span12);
    			append_dev(span12, svg8);
    			append_dev(svg8, path8);
    			append_dev(svg8, circle3);
    			append_dev(li3, t34);
    			append_dev(li3, span13);
    			append_dev(span13, t35);
    			append_dev(span13, br);
    			append_dev(span13, t36);
    			append_dev(ul1, t37);
    			append_dev(ul1, li4);
    			append_dev(li4, span14);
    			append_dev(span14, svg9);
    			append_dev(svg9, path9);
    			append_dev(li4, t38);
    			append_dev(li4, span15);
    			append_dev(ul1, t40);
    			append_dev(ul1, li5);
    			append_dev(li5, span16);
    			append_dev(span16, svg10);
    			append_dev(svg10, path10);
    			append_dev(svg10, polyline3);
    			append_dev(li5, t41);
    			append_dev(li5, a3);
    			append_dev(div12, t43);
    			append_dev(div12, div11);
    			append_dev(div11, div10);
    			append_dev(div10, p2);
    			append_dev(div10, t47);
    			append_dev(div10, div9);
    			append_dev(div9, p3);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(footer);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Footer', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Footer> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Footer extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Footer",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    /* src\components\CategoryFilter.svelte generated by Svelte v3.59.2 */
    const file$4 = "src\\components\\CategoryFilter.svelte";

    function get_each_context_1$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[8] = list[i];
    	return child_ctx;
    }

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[8] = list[i];
    	return child_ctx;
    }

    // (60:0) {:else}
    function create_else_block$3(ctx) {
    	let div3;
    	let h3;
    	let t1;
    	let div0;
    	let svg0;
    	let path0;
    	let path1;
    	let line0;
    	let line1;
    	let line2;
    	let t2;
    	let ul;
    	let li;
    	let button;
    	let div1;
    	let span;
    	let svg1;
    	let line3;
    	let line4;
    	let line5;
    	let line6;
    	let line7;
    	let line8;
    	let span_class_value;
    	let t3;
    	let button_class_value;
    	let t4;
    	let t5;
    	let div2;
    	let t6;
    	let p;
    	let mounted;
    	let dispose;
    	let each_value_1 = /*categories*/ ctx[0];
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1$1(get_each_context_1$1(ctx, each_value_1, i));
    	}

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			h3 = element("h3");
    			h3.textContent = "Menu Categories";
    			t1 = space();
    			div0 = element("div");
    			svg0 = svg_element("svg");
    			path0 = svg_element("path");
    			path1 = svg_element("path");
    			line0 = svg_element("line");
    			line1 = svg_element("line");
    			line2 = svg_element("line");
    			t2 = space();
    			ul = element("ul");
    			li = element("li");
    			button = element("button");
    			div1 = element("div");
    			span = element("span");
    			svg1 = svg_element("svg");
    			line3 = svg_element("line");
    			line4 = svg_element("line");
    			line5 = svg_element("line");
    			line6 = svg_element("line");
    			line7 = svg_element("line");
    			line8 = svg_element("line");
    			t3 = text("\n            All Categories");
    			t4 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t5 = space();
    			div2 = element("div");
    			t6 = space();
    			p = element("p");
    			p.textContent = "Choose a category to filter the menu";
    			attr_dev(h3, "class", "heading-serif font-semibold text-xl text-coffee-800 mb-4");
    			add_location(h3, file$4, 62, 4, 2372);
    			attr_dev(path0, "d", "M18 8h1a4 4 0 010 8h-1");
    			add_location(path0, file$4, 67, 8, 2761);
    			attr_dev(path1, "d", "M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z");
    			add_location(path1, file$4, 68, 8, 2810);
    			attr_dev(line0, "x1", "6");
    			attr_dev(line0, "y1", "1");
    			attr_dev(line0, "x2", "6");
    			attr_dev(line0, "y2", "4");
    			add_location(line0, file$4, 69, 8, 2877);
    			attr_dev(line1, "x1", "10");
    			attr_dev(line1, "y1", "1");
    			attr_dev(line1, "x2", "10");
    			attr_dev(line1, "y2", "4");
    			add_location(line1, file$4, 70, 8, 2927);
    			attr_dev(line2, "x1", "14");
    			attr_dev(line2, "y1", "1");
    			attr_dev(line2, "x2", "14");
    			attr_dev(line2, "y2", "4");
    			add_location(line2, file$4, 71, 8, 2979);
    			attr_dev(svg0, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg0, "viewBox", "0 0 24 24");
    			attr_dev(svg0, "fill", "none");
    			attr_dev(svg0, "stroke", "currentColor");
    			attr_dev(svg0, "stroke-width", "2");
    			attr_dev(svg0, "stroke-linecap", "round");
    			attr_dev(svg0, "stroke-linejoin", "round");
    			attr_dev(svg0, "class", "w-5 h-5");
    			add_location(svg0, file$4, 66, 6, 2578);
    			attr_dev(div0, "class", "absolute top-4 right-4 text-coffee-400");
    			add_location(div0, file$4, 65, 4, 2519);
    			attr_dev(line3, "x1", "8");
    			attr_dev(line3, "y1", "6");
    			attr_dev(line3, "x2", "21");
    			attr_dev(line3, "y2", "6");
    			add_location(line3, file$4, 90, 16, 3901);
    			attr_dev(line4, "x1", "8");
    			attr_dev(line4, "y1", "12");
    			attr_dev(line4, "x2", "21");
    			attr_dev(line4, "y2", "12");
    			add_location(line4, file$4, 91, 16, 3960);
    			attr_dev(line5, "x1", "8");
    			attr_dev(line5, "y1", "18");
    			attr_dev(line5, "x2", "21");
    			attr_dev(line5, "y2", "18");
    			add_location(line5, file$4, 92, 16, 4021);
    			attr_dev(line6, "x1", "3");
    			attr_dev(line6, "y1", "6");
    			attr_dev(line6, "x2", "3.01");
    			attr_dev(line6, "y2", "6");
    			add_location(line6, file$4, 93, 16, 4082);
    			attr_dev(line7, "x1", "3");
    			attr_dev(line7, "y1", "12");
    			attr_dev(line7, "x2", "3.01");
    			attr_dev(line7, "y2", "12");
    			add_location(line7, file$4, 94, 16, 4143);
    			attr_dev(line8, "x1", "3");
    			attr_dev(line8, "y1", "18");
    			attr_dev(line8, "x2", "3.01");
    			attr_dev(line8, "y2", "18");
    			add_location(line8, file$4, 95, 16, 4206);
    			attr_dev(svg1, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg1, "viewBox", "0 0 24 24");
    			attr_dev(svg1, "fill", "none");
    			attr_dev(svg1, "stroke", "currentColor");
    			attr_dev(svg1, "stroke-width", "2");
    			attr_dev(svg1, "stroke-linecap", "round");
    			attr_dev(svg1, "stroke-linejoin", "round");
    			attr_dev(svg1, "class", "w-4 h-4");
    			add_location(svg1, file$4, 89, 14, 3710);

    			attr_dev(span, "class", span_class_value = "mr-3 " + (!/*activeCategory*/ ctx[1]
    			? 'text-coffee-800'
    			: 'text-coffee-400 group-hover:text-coffee-600'));

    			add_location(span, file$4, 88, 12, 3590);
    			attr_dev(div1, "class", "flex items-center");
    			add_location(div1, file$4, 86, 10, 3501);

    			attr_dev(button, "class", button_class_value = "group w-full text-left px-4 py-3 rounded-xl text-sm transition-all duration-300 " + (!/*activeCategory*/ ctx[1]
    			? 'bg-cream-600 text-coffee-900 font-medium shadow-sm'
    			: 'text-coffee-800 hover:bg-coffee-50 hover:pl-5'));

    			add_location(button, file$4, 79, 8, 3164);
    			add_location(li, file$4, 78, 6, 3151);
    			attr_dev(ul, "class", "space-y-2");
    			add_location(ul, file$4, 76, 4, 3083);
    			attr_dev(div2, "class", "mt-6 h-px bg-gradient-to-r from-transparent via-coffee-200 to-transparent");
    			add_location(div2, file$4, 128, 4, 5558);
    			attr_dev(p, "class", "mt-4 text-xs text-coffee-500 text-center");
    			add_location(p, file$4, 129, 4, 5656);
    			attr_dev(div3, "class", "bg-white rounded-2xl shadow-soft p-5 border border-coffee-100 sticky top-24");
    			add_location(div3, file$4, 61, 2, 2278);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, h3);
    			append_dev(div3, t1);
    			append_dev(div3, div0);
    			append_dev(div0, svg0);
    			append_dev(svg0, path0);
    			append_dev(svg0, path1);
    			append_dev(svg0, line0);
    			append_dev(svg0, line1);
    			append_dev(svg0, line2);
    			append_dev(div3, t2);
    			append_dev(div3, ul);
    			append_dev(ul, li);
    			append_dev(li, button);
    			append_dev(button, div1);
    			append_dev(div1, span);
    			append_dev(span, svg1);
    			append_dev(svg1, line3);
    			append_dev(svg1, line4);
    			append_dev(svg1, line5);
    			append_dev(svg1, line6);
    			append_dev(svg1, line7);
    			append_dev(svg1, line8);
    			append_dev(div1, t3);
    			append_dev(ul, t4);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(ul, null);
    				}
    			}

    			append_dev(div3, t5);
    			append_dev(div3, div2);
    			append_dev(div3, t6);
    			append_dev(div3, p);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*scrollToTop*/ ctx[4], false, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*activeCategory*/ 2 && span_class_value !== (span_class_value = "mr-3 " + (!/*activeCategory*/ ctx[1]
    			? 'text-coffee-800'
    			: 'text-coffee-400 group-hover:text-coffee-600'))) {
    				attr_dev(span, "class", span_class_value);
    			}

    			if (dirty & /*activeCategory*/ 2 && button_class_value !== (button_class_value = "group w-full text-left px-4 py-3 rounded-xl text-sm transition-all duration-300 " + (!/*activeCategory*/ ctx[1]
    			? 'bg-cream-600 text-coffee-900 font-medium shadow-sm'
    			: 'text-coffee-800 hover:bg-coffee-50 hover:pl-5'))) {
    				attr_dev(button, "class", button_class_value);
    			}

    			if (dirty & /*activeCategory, categories, selectCategory*/ 11) {
    				each_value_1 = /*categories*/ ctx[0];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1$1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(ul, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_1.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$3.name,
    		type: "else",
    		source: "(60:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (22:0) {#if isMobile}
    function create_if_block$4(ctx) {
    	let div4;
    	let div0;
    	let t0;
    	let div2;
    	let div1;
    	let button;
    	let t1;
    	let button_class_value;
    	let t2;
    	let t3;
    	let div3;
    	let mounted;
    	let dispose;
    	let each_value = /*categories*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div4 = element("div");
    			div0 = element("div");
    			t0 = space();
    			div2 = element("div");
    			div1 = element("div");
    			button = element("button");
    			t1 = text("All Items");
    			t2 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t3 = space();
    			div3 = element("div");
    			attr_dev(div0, "class", "absolute left-0 top-0 h-full w-8 bg-gradient-to-r from-coffee-50 to-transparent z-10 pointer-events-none");
    			add_location(div0, file$4, 25, 4, 671);

    			attr_dev(button, "class", button_class_value = "px-5 py-2.5 rounded-xl text-sm whitespace-nowrap font-medium transition-all duration-300 shadow-sm " + (!/*activeCategory*/ ctx[1]
    			? 'bg-cream-600 text-coffee-900 shadow-md ring-2 ring-cream-300'
    			: 'bg-white text-coffee-800 hover:bg-coffee-50 hover:-translate-y-0.5 hover:shadow'));

    			add_location(button, file$4, 31, 8, 982);
    			attr_dev(div1, "class", "flex space-x-3 min-w-max px-2");
    			add_location(div1, file$4, 29, 6, 900);
    			attr_dev(div2, "class", "overflow-x-auto py-2 px-1 hide-scrollbar svelte-1q5wua5");
    			add_location(div2, file$4, 28, 4, 839);
    			attr_dev(div3, "class", "absolute right-0 top-0 h-full w-8 bg-gradient-to-l from-coffee-50 to-transparent z-10 pointer-events-none");
    			add_location(div3, file$4, 57, 4, 2073);
    			attr_dev(div4, "class", "relative mb-6");
    			add_location(div4, file$4, 23, 2, 599);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div4, anchor);
    			append_dev(div4, div0);
    			append_dev(div4, t0);
    			append_dev(div4, div2);
    			append_dev(div2, div1);
    			append_dev(div1, button);
    			append_dev(button, t1);
    			append_dev(div1, t2);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(div1, null);
    				}
    			}

    			append_dev(div4, t3);
    			append_dev(div4, div3);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*scrollToTop*/ ctx[4], false, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*activeCategory*/ 2 && button_class_value !== (button_class_value = "px-5 py-2.5 rounded-xl text-sm whitespace-nowrap font-medium transition-all duration-300 shadow-sm " + (!/*activeCategory*/ ctx[1]
    			? 'bg-cream-600 text-coffee-900 shadow-md ring-2 ring-cream-300'
    			: 'bg-white text-coffee-800 hover:bg-coffee-50 hover:-translate-y-0.5 hover:shadow'))) {
    				attr_dev(button, "class", button_class_value);
    			}

    			if (dirty & /*activeCategory, categories, selectCategory*/ 11) {
    				each_value = /*categories*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div1, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div4);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$4.name,
    		type: "if",
    		source: "(22:0) {#if isMobile}",
    		ctx
    	});

    	return block;
    }

    // (105:6) {#each categories as category}
    function create_each_block_1$1(ctx) {
    	let li;
    	let button;
    	let div;
    	let span;
    	let svg;
    	let polyline;
    	let span_class_value;
    	let t0;
    	let t1_value = /*category*/ ctx[8].name + "";
    	let t1;
    	let button_class_value;
    	let t2;
    	let mounted;
    	let dispose;

    	function click_handler_1() {
    		return /*click_handler_1*/ ctx[6](/*category*/ ctx[8]);
    	}

    	const block = {
    		c: function create() {
    			li = element("li");
    			button = element("button");
    			div = element("div");
    			span = element("span");
    			svg = svg_element("svg");
    			polyline = svg_element("polyline");
    			t0 = space();
    			t1 = text(t1_value);
    			t2 = space();
    			attr_dev(polyline, "points", "9 18 15 12 9 6");
    			add_location(polyline, file$4, 117, 18, 5309);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "viewBox", "0 0 24 24");
    			attr_dev(svg, "fill", "none");
    			attr_dev(svg, "stroke", "currentColor");
    			attr_dev(svg, "stroke-width", "2");
    			attr_dev(svg, "stroke-linecap", "round");
    			attr_dev(svg, "stroke-linejoin", "round");
    			attr_dev(svg, "class", "w-4 h-4");
    			add_location(svg, file$4, 116, 16, 5116);

    			attr_dev(span, "class", span_class_value = "mr-3 " + (/*activeCategory*/ ctx[1] === /*category*/ ctx[8].id
    			? 'text-coffee-800'
    			: 'text-coffee-400 group-hover:text-coffee-600'));

    			add_location(span, file$4, 115, 14, 4979);
    			attr_dev(div, "class", "flex items-center");
    			add_location(div, file$4, 113, 12, 4866);

    			attr_dev(button, "class", button_class_value = "group w-full text-left px-4 py-3 rounded-xl text-sm transition-all duration-300 " + (/*activeCategory*/ ctx[1] === /*category*/ ctx[8].id
    			? 'bg-cream-600 text-coffee-900 font-medium shadow-sm'
    			: 'text-coffee-800 hover:bg-coffee-50 hover:pl-5'));

    			add_location(button, file$4, 106, 10, 4478);
    			add_location(li, file$4, 105, 8, 4463);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, button);
    			append_dev(button, div);
    			append_dev(div, span);
    			append_dev(span, svg);
    			append_dev(svg, polyline);
    			append_dev(div, t0);
    			append_dev(div, t1);
    			append_dev(li, t2);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", click_handler_1, false, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty & /*activeCategory, categories*/ 3 && span_class_value !== (span_class_value = "mr-3 " + (/*activeCategory*/ ctx[1] === /*category*/ ctx[8].id
    			? 'text-coffee-800'
    			: 'text-coffee-400 group-hover:text-coffee-600'))) {
    				attr_dev(span, "class", span_class_value);
    			}

    			if (dirty & /*categories*/ 1 && t1_value !== (t1_value = /*category*/ ctx[8].name + "")) set_data_dev(t1, t1_value);

    			if (dirty & /*activeCategory, categories*/ 3 && button_class_value !== (button_class_value = "group w-full text-left px-4 py-3 rounded-xl text-sm transition-all duration-300 " + (/*activeCategory*/ ctx[1] === /*category*/ ctx[8].id
    			? 'bg-cream-600 text-coffee-900 font-medium shadow-sm'
    			: 'text-coffee-800 hover:bg-coffee-50 hover:pl-5'))) {
    				attr_dev(button, "class", button_class_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1$1.name,
    		type: "each",
    		source: "(105:6) {#each categories as category}",
    		ctx
    	});

    	return block;
    }

    // (43:8) {#each categories as category}
    function create_each_block$1(ctx) {
    	let button;
    	let t0_value = /*category*/ ctx[8].name + "";
    	let t0;
    	let t1;
    	let button_class_value;
    	let mounted;
    	let dispose;

    	function click_handler() {
    		return /*click_handler*/ ctx[5](/*category*/ ctx[8]);
    	}

    	const block = {
    		c: function create() {
    			button = element("button");
    			t0 = text(t0_value);
    			t1 = space();

    			attr_dev(button, "class", button_class_value = "px-5 py-2.5 rounded-xl text-sm whitespace-nowrap font-medium transition-all duration-300 shadow-sm " + (/*activeCategory*/ ctx[1] === /*category*/ ctx[8].id
    			? 'bg-cream-600 text-coffee-900 shadow-md ring-2 ring-cream-300'
    			: 'bg-white text-coffee-800 hover:bg-coffee-50 hover:-translate-y-0.5 hover:shadow'));

    			add_location(button, file$4, 43, 10, 1496);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			append_dev(button, t0);
    			append_dev(button, t1);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", click_handler, false, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*categories*/ 1 && t0_value !== (t0_value = /*category*/ ctx[8].name + "")) set_data_dev(t0, t0_value);

    			if (dirty & /*activeCategory, categories*/ 3 && button_class_value !== (button_class_value = "px-5 py-2.5 rounded-xl text-sm whitespace-nowrap font-medium transition-all duration-300 shadow-sm " + (/*activeCategory*/ ctx[1] === /*category*/ ctx[8].id
    			? 'bg-cream-600 text-coffee-900 shadow-md ring-2 ring-cream-300'
    			: 'bg-white text-coffee-800 hover:bg-coffee-50 hover:-translate-y-0.5 hover:shadow'))) {
    				attr_dev(button, "class", button_class_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(43:8) {#each categories as category}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let if_block_anchor;

    	function select_block_type(ctx, dirty) {
    		if (/*isMobile*/ ctx[2]) return create_if_block$4;
    		return create_else_block$3;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('CategoryFilter', slots, []);
    	let { categories = [] } = $$props;
    	let { activeCategory = null } = $$props;
    	let { isMobile = false } = $$props;
    	const dispatch = createEventDispatcher();

    	function selectCategory(categoryId) {
    		dispatch('selectCategory', {
    			category: categoryId === activeCategory ? null : categoryId
    		});
    	}

    	function scrollToTop() {
    		window.scrollTo({ top: 0, behavior: 'smooth' });
    		dispatch('selectCategory', { category: null });
    	}

    	const writable_props = ['categories', 'activeCategory', 'isMobile'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<CategoryFilter> was created with unknown prop '${key}'`);
    	});

    	const click_handler = category => selectCategory(category.id);
    	const click_handler_1 = category => selectCategory(category.id);

    	$$self.$$set = $$props => {
    		if ('categories' in $$props) $$invalidate(0, categories = $$props.categories);
    		if ('activeCategory' in $$props) $$invalidate(1, activeCategory = $$props.activeCategory);
    		if ('isMobile' in $$props) $$invalidate(2, isMobile = $$props.isMobile);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		categories,
    		activeCategory,
    		isMobile,
    		dispatch,
    		selectCategory,
    		scrollToTop
    	});

    	$$self.$inject_state = $$props => {
    		if ('categories' in $$props) $$invalidate(0, categories = $$props.categories);
    		if ('activeCategory' in $$props) $$invalidate(1, activeCategory = $$props.activeCategory);
    		if ('isMobile' in $$props) $$invalidate(2, isMobile = $$props.isMobile);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		categories,
    		activeCategory,
    		isMobile,
    		selectCategory,
    		scrollToTop,
    		click_handler,
    		click_handler_1
    	];
    }

    class CategoryFilter extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {
    			categories: 0,
    			activeCategory: 1,
    			isMobile: 2
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "CategoryFilter",
    			options,
    			id: create_fragment$4.name
    		});
    	}

    	get categories() {
    		throw new Error("<CategoryFilter>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set categories(value) {
    		throw new Error("<CategoryFilter>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get activeCategory() {
    		throw new Error("<CategoryFilter>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set activeCategory(value) {
    		throw new Error("<CategoryFilter>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isMobile() {
    		throw new Error("<CategoryFilter>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isMobile(value) {
    		throw new Error("<CategoryFilter>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\MusicPlayer.svelte generated by Svelte v3.59.2 */

    const { console: console_1$1 } = globals;
    const file$3 = "src\\components\\MusicPlayer.svelte";

    // (183:2) {:else}
    function create_else_block$2(ctx) {
    	let div8;
    	let div4;
    	let t0;
    	let div1;
    	let div0;

    	let t1_value = (/*playing*/ ctx[0]
    	? /*MUSIC_OPTIONS*/ ctx[5][/*currentTrack*/ ctx[1]].title
    	: 'Yoya Music') + "";

    	let t1;
    	let t2;
    	let div3;
    	let div2;
    	let svg0;
    	let path0;
    	let t3;
    	let div5;
    	let input;
    	let t4;
    	let div6;
    	let button0;
    	let svg1;
    	let path1;
    	let t5;
    	let button1;
    	let button1_class_value;
    	let button1_aria_label_value;
    	let t6;
    	let button2;
    	let svg2;
    	let path2;
    	let t7;
    	let div7;
    	let t8;
    	let t9_value = /*currentTrack*/ ctx[1] + 1 + "";
    	let t9;
    	let t10;
    	let t11_value = /*MUSIC_OPTIONS*/ ctx[5].length + "";
    	let t11;
    	let mounted;
    	let dispose;

    	function select_block_type_1(ctx, dirty) {
    		if (/*isMobile*/ ctx[4]) return create_if_block_2$1;
    		return create_else_block_2;
    	}

    	let current_block_type = select_block_type_1(ctx);
    	let if_block0 = current_block_type(ctx);

    	function select_block_type_2(ctx, dirty) {
    		if (/*playing*/ ctx[0]) return create_if_block_1$1;
    		return create_else_block_1;
    	}

    	let current_block_type_1 = select_block_type_2(ctx);
    	let if_block1 = current_block_type_1(ctx);

    	const block = {
    		c: function create() {
    			div8 = element("div");
    			div4 = element("div");
    			if_block0.c();
    			t0 = space();
    			div1 = element("div");
    			div0 = element("div");
    			t1 = text(t1_value);
    			t2 = space();
    			div3 = element("div");
    			div2 = element("div");
    			svg0 = svg_element("svg");
    			path0 = svg_element("path");
    			t3 = space();
    			div5 = element("div");
    			input = element("input");
    			t4 = space();
    			div6 = element("div");
    			button0 = element("button");
    			svg1 = svg_element("svg");
    			path1 = svg_element("path");
    			t5 = space();
    			button1 = element("button");
    			if_block1.c();
    			t6 = space();
    			button2 = element("button");
    			svg2 = svg_element("svg");
    			path2 = svg_element("path");
    			t7 = space();
    			div7 = element("div");
    			t8 = text("Track ");
    			t9 = text(t9_value);
    			t10 = text("/");
    			t11 = text(t11_value);
    			attr_dev(div0, "class", "text-sm font-medium text-coffee-800 truncate");
    			add_location(div0, file$3, 214, 10, 6826);
    			attr_dev(div1, "class", "flex-1 px-2 text-center");
    			add_location(div1, file$3, 213, 8, 6778);
    			attr_dev(path0, "stroke-linecap", "round");
    			attr_dev(path0, "stroke-linejoin", "round");
    			attr_dev(path0, "stroke-width", "2");
    			attr_dev(path0, "d", "M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z");
    			add_location(path0, file$3, 223, 14, 7242);
    			attr_dev(svg0, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg0, "fill", "none");
    			attr_dev(svg0, "viewBox", "0 0 24 24");
    			attr_dev(svg0, "stroke", "currentColor");
    			add_location(svg0, file$3, 222, 12, 7133);
    			attr_dev(div2, "class", "w-5 h-5 text-coffee-700");
    			add_location(div2, file$3, 221, 10, 7083);
    			attr_dev(div3, "class", "flex items-center");
    			add_location(div3, file$3, 220, 8, 7041);
    			attr_dev(div4, "class", "flex items-center justify-between mb-2");
    			add_location(div4, file$3, 188, 6, 5528);
    			attr_dev(input, "type", "range");
    			attr_dev(input, "min", "0");
    			attr_dev(input, "max", "100");
    			attr_dev(input, "class", "w-full h-1.5 bg-coffee-200 rounded-full appearance-none cursor-pointer outline-none svelte-t4of7y");
    			add_location(input, file$3, 232, 8, 7659);
    			attr_dev(div5, "class", "w-full mb-3");
    			add_location(div5, file$3, 231, 6, 7625);
    			attr_dev(path1, "stroke-linecap", "round");
    			attr_dev(path1, "stroke-linejoin", "round");
    			attr_dev(path1, "stroke-width", "2");
    			attr_dev(path1, "d", "M15 19l-7-7 7-7");
    			add_location(path1, file$3, 251, 12, 8415);
    			attr_dev(svg1, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg1, "class", "h-5 w-5 text-coffee-700");
    			attr_dev(svg1, "fill", "none");
    			attr_dev(svg1, "viewBox", "0 0 24 24");
    			attr_dev(svg1, "stroke", "currentColor");
    			add_location(svg1, file$3, 250, 10, 8276);
    			attr_dev(button0, "class", "w-10 h-10 flex items-center justify-center rounded-full hover:bg-coffee-100 transition-colors");
    			attr_dev(button0, "aria-label", "Previous track");
    			add_location(button0, file$3, 245, 8, 8063);
    			attr_dev(button1, "class", button1_class_value = "w-12 h-12 flex items-center justify-center rounded-full " + (/*playing*/ ctx[0] ? 'bg-coffee-200' : 'bg-coffee-100') + " hover:bg-coffee-300 transition-colors");
    			attr_dev(button1, "aria-label", button1_aria_label_value = /*playing*/ ctx[0] ? 'Pause music' : 'Play music');
    			add_location(button1, file$3, 256, 8, 8595);
    			attr_dev(path2, "stroke-linecap", "round");
    			attr_dev(path2, "stroke-linejoin", "round");
    			attr_dev(path2, "stroke-width", "2");
    			attr_dev(path2, "d", "M9 5l7 7-7 7");
    			add_location(path2, file$3, 279, 12, 9978);
    			attr_dev(svg2, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg2, "class", "h-5 w-5 text-coffee-700");
    			attr_dev(svg2, "fill", "none");
    			attr_dev(svg2, "viewBox", "0 0 24 24");
    			attr_dev(svg2, "stroke", "currentColor");
    			add_location(svg2, file$3, 278, 10, 9839);
    			attr_dev(button2, "class", "w-10 h-10 flex items-center justify-center rounded-full hover:bg-coffee-100 transition-colors");
    			attr_dev(button2, "aria-label", "Next track");
    			add_location(button2, file$3, 273, 8, 9630);
    			attr_dev(div6, "class", "flex justify-between items-center");
    			add_location(div6, file$3, 243, 6, 7975);
    			attr_dev(div7, "class", "text-xs text-coffee-600 text-center mt-2");
    			add_location(div7, file$3, 285, 6, 10165);
    			attr_dev(div8, "class", "bg-white bg-opacity-95 rounded-xl shadow-lg p-3 flex flex-col overflow-hidden relative transition-all duration-300 animate-fadeIn svelte-t4of7y");
    			add_location(div8, file$3, 184, 4, 5297);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div8, anchor);
    			append_dev(div8, div4);
    			if_block0.m(div4, null);
    			append_dev(div4, t0);
    			append_dev(div4, div1);
    			append_dev(div1, div0);
    			append_dev(div0, t1);
    			append_dev(div4, t2);
    			append_dev(div4, div3);
    			append_dev(div3, div2);
    			append_dev(div2, svg0);
    			append_dev(svg0, path0);
    			append_dev(div8, t3);
    			append_dev(div8, div5);
    			append_dev(div5, input);
    			set_input_value(input, /*volume*/ ctx[2]);
    			append_dev(div8, t4);
    			append_dev(div8, div6);
    			append_dev(div6, button0);
    			append_dev(button0, svg1);
    			append_dev(svg1, path1);
    			append_dev(div6, t5);
    			append_dev(div6, button1);
    			if_block1.m(button1, null);
    			append_dev(div6, t6);
    			append_dev(div6, button2);
    			append_dev(button2, svg2);
    			append_dev(svg2, path2);
    			append_dev(div8, t7);
    			append_dev(div8, div7);
    			append_dev(div7, t8);
    			append_dev(div7, t9);
    			append_dev(div7, t10);
    			append_dev(div7, t11);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "change", /*input_change_input_handler*/ ctx[12]),
    					listen_dev(input, "input", /*input_change_input_handler*/ ctx[12]),
    					listen_dev(input, "input", /*input_handler*/ ctx[13], false, false, false, false),
    					listen_dev(button0, "click", /*playPrevTrack*/ ctx[9], false, false, false, false),
    					listen_dev(button1, "click", /*togglePlay*/ ctx[6], false, false, false, false),
    					listen_dev(button2, "click", /*playNextTrack*/ ctx[8], false, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type_1(ctx)) && if_block0) {
    				if_block0.p(ctx, dirty);
    			} else {
    				if_block0.d(1);
    				if_block0 = current_block_type(ctx);

    				if (if_block0) {
    					if_block0.c();
    					if_block0.m(div4, t0);
    				}
    			}

    			if (dirty & /*playing, currentTrack*/ 3 && t1_value !== (t1_value = (/*playing*/ ctx[0]
    			? /*MUSIC_OPTIONS*/ ctx[5][/*currentTrack*/ ctx[1]].title
    			: 'Yoya Music') + "")) set_data_dev(t1, t1_value);

    			if (dirty & /*volume*/ 4) {
    				set_input_value(input, /*volume*/ ctx[2]);
    			}

    			if (current_block_type_1 !== (current_block_type_1 = select_block_type_2(ctx))) {
    				if_block1.d(1);
    				if_block1 = current_block_type_1(ctx);

    				if (if_block1) {
    					if_block1.c();
    					if_block1.m(button1, null);
    				}
    			}

    			if (dirty & /*playing*/ 1 && button1_class_value !== (button1_class_value = "w-12 h-12 flex items-center justify-center rounded-full " + (/*playing*/ ctx[0] ? 'bg-coffee-200' : 'bg-coffee-100') + " hover:bg-coffee-300 transition-colors")) {
    				attr_dev(button1, "class", button1_class_value);
    			}

    			if (dirty & /*playing*/ 1 && button1_aria_label_value !== (button1_aria_label_value = /*playing*/ ctx[0] ? 'Pause music' : 'Play music')) {
    				attr_dev(button1, "aria-label", button1_aria_label_value);
    			}

    			if (dirty & /*currentTrack*/ 2 && t9_value !== (t9_value = /*currentTrack*/ ctx[1] + 1 + "")) set_data_dev(t9, t9_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div8);
    			if_block0.d();
    			if_block1.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$2.name,
    		type: "else",
    		source: "(183:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (169:2) {#if isCollapsed && isMobile}
    function create_if_block$3(ctx) {
    	let div;
    	let button;
    	let svg;
    	let path;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			button = element("button");
    			svg = svg_element("svg");
    			path = svg_element("path");
    			attr_dev(path, "fill-rule", "evenodd");
    			attr_dev(path, "d", "M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z");
    			attr_dev(path, "clip-rule", "evenodd");
    			add_location(path, file$3, 178, 10, 5049);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "class", "h-6 w-6 text-coffee-800");
    			attr_dev(svg, "viewBox", "0 0 20 20");
    			attr_dev(svg, "fill", "currentColor");
    			add_location(svg, file$3, 177, 8, 4926);
    			attr_dev(button, "class", "w-12 h-12 flex items-center justify-center rounded-full bg-coffee-100 hover:bg-coffee-300 transition-colors");
    			attr_dev(button, "aria-label", "Expand music player");
    			add_location(button, file$3, 172, 6, 4658);
    			attr_dev(div, "class", "bg-white bg-opacity-95 rounded-full shadow-lg p-2 transition-all duration-300 animate-fadeIn svelte-t4of7y");
    			add_location(div, file$3, 169, 4, 4533);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, button);
    			append_dev(button, svg);
    			append_dev(svg, path);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*click_handler*/ ctx[10], false, false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(169:2) {#if isCollapsed && isMobile}",
    		ctx
    	});

    	return block;
    }

    // (201:8) {:else}
    function create_else_block_2(ctx) {
    	let div;
    	let svg;
    	let path0;
    	let path1;

    	const block = {
    		c: function create() {
    			div = element("div");
    			svg = svg_element("svg");
    			path0 = svg_element("path");
    			path1 = svg_element("path");
    			attr_dev(path0, "stroke-linecap", "round");
    			attr_dev(path0, "stroke-linejoin", "round");
    			attr_dev(path0, "stroke-width", "2");
    			attr_dev(path0, "d", "M18 8h1a4 4 0 010 8h-1M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z");
    			add_location(path0, file$3, 204, 14, 6396);
    			attr_dev(path1, "stroke-linecap", "round");
    			attr_dev(path1, "stroke-linejoin", "round");
    			attr_dev(path1, "stroke-width", "2");
    			attr_dev(path1, "d", "M6 1v3M10 1v3M14 1v3");
    			add_location(path1, file$3, 206, 14, 6567);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "viewBox", "0 0 24 24");
    			attr_dev(svg, "fill", "none");
    			attr_dev(svg, "stroke", "currentColor");
    			add_location(svg, file$3, 203, 12, 6287);
    			attr_dev(div, "class", "w-6 h-6 text-coffee-700");
    			add_location(div, file$3, 202, 10, 6237);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, svg);
    			append_dev(svg, path0);
    			append_dev(svg, path1);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_2.name,
    		type: "else",
    		source: "(201:8) {:else}",
    		ctx
    	});

    	return block;
    }

    // (190:8) {#if isMobile}
    function create_if_block_2$1(ctx) {
    	let button;
    	let svg;
    	let path;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			svg = svg_element("svg");
    			path = svg_element("path");
    			attr_dev(path, "stroke-linecap", "round");
    			attr_dev(path, "stroke-linejoin", "round");
    			attr_dev(path, "stroke-width", "2");
    			attr_dev(path, "d", "M6 18L18 6M6 6l12 12");
    			add_location(path, file$3, 197, 14, 6028);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "class", "w-5 h-5");
    			attr_dev(svg, "fill", "none");
    			attr_dev(svg, "viewBox", "0 0 24 24");
    			attr_dev(svg, "stroke", "currentColor");
    			add_location(svg, file$3, 196, 12, 5903);
    			attr_dev(button, "class", "w-6 h-6 flex items-center justify-center text-coffee-600 hover:text-coffee-800 transition-colors");
    			attr_dev(button, "aria-label", "Collapse music player");
    			add_location(button, file$3, 191, 10, 5659);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			append_dev(button, svg);
    			append_dev(svg, path);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*click_handler_1*/ ctx[11], false, false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$1.name,
    		type: "if",
    		source: "(190:8) {#if isMobile}",
    		ctx
    	});

    	return block;
    }

    // (266:10) {:else}
    function create_else_block_1(ctx) {
    	let svg;
    	let path;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			path = svg_element("path");
    			attr_dev(path, "fill-rule", "evenodd");
    			attr_dev(path, "d", "M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z");
    			attr_dev(path, "clip-rule", "evenodd");
    			add_location(path, file$3, 267, 14, 9375);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "class", "h-6 w-6 text-coffee-800");
    			attr_dev(svg, "viewBox", "0 0 20 20");
    			attr_dev(svg, "fill", "currentColor");
    			add_location(svg, file$3, 266, 12, 9248);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, path);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_1.name,
    		type: "else",
    		source: "(266:10) {:else}",
    		ctx
    	});

    	return block;
    }

    // (262:10) {#if playing}
    function create_if_block_1$1(ctx) {
    	let svg;
    	let path;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			path = svg_element("path");
    			attr_dev(path, "fill-rule", "evenodd");
    			attr_dev(path, "d", "M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z");
    			attr_dev(path, "clip-rule", "evenodd");
    			add_location(path, file$3, 263, 14, 9030);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "class", "h-6 w-6 text-coffee-800");
    			attr_dev(svg, "viewBox", "0 0 20 20");
    			attr_dev(svg, "fill", "currentColor");
    			add_location(svg, file$3, 262, 12, 8903);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, path);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(262:10) {#if playing}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let div1;
    	let t;
    	let div0;

    	function select_block_type(ctx, dirty) {
    		if (/*isCollapsed*/ ctx[3] && /*isMobile*/ ctx[4]) return create_if_block$3;
    		return create_else_block$2;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			if_block.c();
    			t = space();
    			div0 = element("div");
    			attr_dev(div0, "id", "youtube-player");
    			attr_dev(div0, "class", "hidden");
    			add_location(div0, file$3, 292, 2, 10348);
    			attr_dev(div1, "class", "fixed bottom-4 right-4 z-50 transition-all duration-300");
    			add_location(div1, file$3, 166, 0, 4357);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			if_block.m(div1, null);
    			append_dev(div1, t);
    			append_dev(div1, div0);
    		},
    		p: function update(ctx, [dirty]) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(div1, t);
    				}
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('MusicPlayer', slots, []);

    	const MUSIC_OPTIONS = [
    		{
    			id: 'ytpl2_D_s8-Yg',
    			title: 'Coffee Shop Ambience'
    		},
    		{
    			id: '1fueZCTYkpA',
    			title: 'Classical Piano'
    		},
    		{ id: 'JEsF1YSibHM', title: 'Jazz Coffee' }
    	];

    	let playerReady = false;
    	let playing = false;
    	let currentTrack = 0;
    	let volume = 20; // Default low volume
    	let player;
    	let isCollapsed = true; // Start collapsed on mobile
    	let isMobile = false;

    	// Toggle collapsed state
    	function toggleCollapsed() {
    		$$invalidate(3, isCollapsed = !isCollapsed);
    	}

    	// Check if on mobile device
    	function checkMobile() {
    		$$invalidate(4, isMobile = window.innerWidth < 768);

    		// On mobile, start collapsed unless playing
    		if (isMobile && !playing) {
    			$$invalidate(3, isCollapsed = true);
    		}
    	}

    	onMount(() => {
    		// Check for mobile screen
    		checkMobile();

    		window.addEventListener('resize', checkMobile);

    		// Check if music was playing in previous session
    		const savedState = localStorage.getItem('yoyaCoffeeMusic');

    		if (savedState) {
    			const state = JSON.parse(savedState);
    			$$invalidate(2, volume = state.volume || 20);
    			$$invalidate(1, currentTrack = state.track || 0);
    			$$invalidate(0, playing = state.playing || false);

    			// If was playing previously, we'll uncollapse
    			if (playing) {
    				$$invalidate(3, isCollapsed = false);
    			}
    		}

    		// Load YouTube API script
    		const tag = document.createElement('script');

    		tag.src = 'https://www.youtube.com/iframe_api';
    		const firstScriptTag = document.getElementsByTagName('script')[0];
    		firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

    		// Initialize player when API is ready
    		window.onYouTubeIframeAPIReady = () => {
    			player = new YT.Player('youtube-player',
    			{
    					height: '0',
    					width: '0',
    					videoId: MUSIC_OPTIONS[currentTrack].id,
    					playerVars: {
    						autoplay: 0, // No autoplay by default
    						controls: 0,
    						showinfo: 0,
    						rel: 0,
    						fs: 0,
    						modestbranding: 1,
    						loop: 1
    					},
    					events: {
    						'onReady': onPlayerReady,
    						'onStateChange': onPlayerStateChange,
    						'onError': onPlayerError
    					}
    				});
    		};

    		return () => {
    			window.removeEventListener('resize', checkMobile);
    		};
    	});

    	function onPlayerReady(event) {
    		playerReady = true;

    		// Set volume to the saved or default level
    		player.setVolume(volume);
    	}

    	function onPlayerStateChange(event) {
    		// Update playing state based on player state
    		$$invalidate(0, playing = event.data === YT.PlayerState.PLAYING);

    		// Save state to localStorage when status changes
    		savePlayerState();

    		// If video ended, play next track
    		if (event.data === YT.PlayerState.ENDED) {
    			playNextTrack();
    		}
    	}

    	function onPlayerError(event) {
    		console.error('YouTube player error:', event.data);

    		// Try playing the next track if there's an error
    		playNextTrack();
    	}

    	function togglePlay() {
    		if (!playerReady) return;

    		if (playing) {
    			player.pauseVideo();
    		} else {
    			player.playVideo();

    			// When play is pressed, ensure player is expanded
    			$$invalidate(3, isCollapsed = false);
    		}
    	}

    	function changeVolume(newVolume) {
    		if (!playerReady) return;
    		$$invalidate(2, volume = newVolume);
    		player.setVolume(volume);
    		savePlayerState();
    	}

    	function playNextTrack() {
    		if (!playerReady) return;
    		$$invalidate(1, currentTrack = (currentTrack + 1) % MUSIC_OPTIONS.length);
    		player.loadVideoById(MUSIC_OPTIONS[currentTrack].id);
    		savePlayerState();
    	}

    	function playPrevTrack() {
    		if (!playerReady) return;
    		$$invalidate(1, currentTrack = (currentTrack - 1 + MUSIC_OPTIONS.length) % MUSIC_OPTIONS.length);
    		player.loadVideoById(MUSIC_OPTIONS[currentTrack].id);
    		savePlayerState();
    	}

    	function savePlayerState() {
    		localStorage.setItem('yoyaCoffeeMusic', JSON.stringify({ playing, volume, track: currentTrack }));
    	}

    	// This function is no longer needed, replaced by toggleCollapsed
    	onDestroy(() => {
    		// Clean up player when component is destroyed
    		if (player && playerReady) {
    			// Save the current state before stopping
    			savePlayerState();

    			player.stopVideo();
    		}
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$1.warn(`<MusicPlayer> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => {
    		$$invalidate(3, isCollapsed = false);
    		if (!playing) togglePlay();
    	};

    	const click_handler_1 = () => $$invalidate(3, isCollapsed = true);

    	function input_change_input_handler() {
    		volume = to_number(this.value);
    		$$invalidate(2, volume);
    	}

    	const input_handler = () => changeVolume(volume);

    	$$self.$capture_state = () => ({
    		onMount,
    		onDestroy,
    		MUSIC_OPTIONS,
    		playerReady,
    		playing,
    		currentTrack,
    		volume,
    		player,
    		isCollapsed,
    		isMobile,
    		toggleCollapsed,
    		checkMobile,
    		onPlayerReady,
    		onPlayerStateChange,
    		onPlayerError,
    		togglePlay,
    		changeVolume,
    		playNextTrack,
    		playPrevTrack,
    		savePlayerState
    	});

    	$$self.$inject_state = $$props => {
    		if ('playerReady' in $$props) playerReady = $$props.playerReady;
    		if ('playing' in $$props) $$invalidate(0, playing = $$props.playing);
    		if ('currentTrack' in $$props) $$invalidate(1, currentTrack = $$props.currentTrack);
    		if ('volume' in $$props) $$invalidate(2, volume = $$props.volume);
    		if ('player' in $$props) player = $$props.player;
    		if ('isCollapsed' in $$props) $$invalidate(3, isCollapsed = $$props.isCollapsed);
    		if ('isMobile' in $$props) $$invalidate(4, isMobile = $$props.isMobile);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		playing,
    		currentTrack,
    		volume,
    		isCollapsed,
    		isMobile,
    		MUSIC_OPTIONS,
    		togglePlay,
    		changeVolume,
    		playNextTrack,
    		playPrevTrack,
    		click_handler,
    		click_handler_1,
    		input_change_input_handler,
    		input_handler
    	];
    }

    class MusicPlayer extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "MusicPlayer",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src\components\ModeToggle.svelte generated by Svelte v3.59.2 */
    const file$2 = "src\\components\\ModeToggle.svelte";

    // (39:8) {:else}
    function create_else_block$1(ctx) {
    	let span;
    	let t;
    	let span_class_value;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text("💰");
    			attr_dev(span, "class", span_class_value = "text-2xl transform " + (/*isAnimating*/ ctx[1] ? 'scale-125' : '') + " transition-transform duration-300");
    			add_location(span, file$2, 39, 10, 1117);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*isAnimating*/ 2 && span_class_value !== (span_class_value = "text-2xl transform " + (/*isAnimating*/ ctx[1] ? 'scale-125' : '') + " transition-transform duration-300")) {
    				attr_dev(span, "class", span_class_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(39:8) {:else}",
    		ctx
    	});

    	return block;
    }

    // (37:8) {#if mode === 'menu'}
    function create_if_block$2(ctx) {
    	let span;
    	let t;
    	let span_class_value;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text("🤤");
    			attr_dev(span, "class", span_class_value = "text-2xl transform " + (/*isAnimating*/ ctx[1] ? 'scale-125' : '') + " transition-transform duration-300");
    			add_location(span, file$2, 37, 10, 981);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*isAnimating*/ 2 && span_class_value !== (span_class_value = "text-2xl transform " + (/*isAnimating*/ ctx[1] ? 'scale-125' : '') + " transition-transform duration-300")) {
    				attr_dev(span, "class", span_class_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(37:8) {#if mode === 'menu'}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let div3;
    	let button;
    	let div2;
    	let div0;
    	let t0;
    	let div1;

    	let t1_value = (/*mode*/ ctx[0] === 'menu'
    	? 'Menu Mode'
    	: 'Payment Mode') + "";

    	let t1;
    	let button_aria_label_value;
    	let mounted;
    	let dispose;

    	function select_block_type(ctx, dirty) {
    		if (/*mode*/ ctx[0] === 'menu') return create_if_block$2;
    		return create_else_block$1;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			button = element("button");
    			div2 = element("div");
    			div0 = element("div");
    			if_block.c();
    			t0 = space();
    			div1 = element("div");
    			t1 = text(t1_value);
    			attr_dev(div0, "class", "w-10 h-10 flex items-center justify-center");
    			add_location(div0, file$2, 35, 6, 884);
    			attr_dev(div1, "class", "ml-2 text-coffee-800 font-medium");
    			add_location(div1, file$2, 43, 6, 1267);
    			attr_dev(div2, "class", "flex items-center");
    			add_location(div2, file$2, 34, 4, 846);
    			attr_dev(button, "class", "bg-white rounded-full shadow-lg p-3 flex items-center hover:shadow-xl transition-all duration-300 transform hover:scale-105");

    			attr_dev(button, "aria-label", button_aria_label_value = /*mode*/ ctx[0] === 'menu'
    			? 'Switch to payment mode'
    			: 'Switch to menu mode');

    			add_location(button, file$2, 29, 2, 581);
    			attr_dev(div3, "class", "fixed bottom-4 left-4 z-50");
    			add_location(div3, file$2, 28, 0, 538);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, button);
    			append_dev(button, div2);
    			append_dev(div2, div0);
    			if_block.m(div0, null);
    			append_dev(div2, t0);
    			append_dev(div2, div1);
    			append_dev(div1, t1);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*handleToggle*/ ctx[2], false, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(div0, null);
    				}
    			}

    			if (dirty & /*mode*/ 1 && t1_value !== (t1_value = (/*mode*/ ctx[0] === 'menu'
    			? 'Menu Mode'
    			: 'Payment Mode') + "")) set_data_dev(t1, t1_value);

    			if (dirty & /*mode*/ 1 && button_aria_label_value !== (button_aria_label_value = /*mode*/ ctx[0] === 'menu'
    			? 'Switch to payment mode'
    			: 'Switch to menu mode')) {
    				attr_dev(button, "aria-label", button_aria_label_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    			if_block.d();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('ModeToggle', slots, []);
    	const dispatch = createEventDispatcher();
    	let { mode = 'menu' } = $$props;

    	function toggleMode() {
    		$$invalidate(0, mode = mode === 'menu' ? 'payment' : 'menu');
    		dispatch('modeChange', { mode });
    	}

    	// Emoji animations
    	let isAnimating = false;

    	function animateEmoji() {
    		$$invalidate(1, isAnimating = true);

    		setTimeout(
    			() => {
    				$$invalidate(1, isAnimating = false);
    			},
    			500
    		);
    	}

    	function handleToggle() {
    		animateEmoji();
    		toggleMode();
    	}

    	const writable_props = ['mode'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<ModeToggle> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('mode' in $$props) $$invalidate(0, mode = $$props.mode);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		dispatch,
    		mode,
    		toggleMode,
    		isAnimating,
    		animateEmoji,
    		handleToggle
    	});

    	$$self.$inject_state = $$props => {
    		if ('mode' in $$props) $$invalidate(0, mode = $$props.mode);
    		if ('isAnimating' in $$props) $$invalidate(1, isAnimating = $$props.isAnimating);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [mode, isAnimating, handleToggle];
    }

    class ModeToggle extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { mode: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ModeToggle",
    			options,
    			id: create_fragment$2.name
    		});
    	}

    	get mode() {
    		throw new Error("<ModeToggle>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set mode(value) {
    		throw new Error("<ModeToggle>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\SplashScreen.svelte generated by Svelte v3.59.2 */
    const file$1 = "src\\components\\SplashScreen.svelte";

    // (22:0) {#if visible}
    function create_if_block$1(ctx) {
    	let div4;
    	let div3;
    	let div2;
    	let div0;
    	let img;
    	let img_src_value;
    	let t0;
    	let div1;
    	let h1;
    	let t2;
    	let p;
    	let div4_class_value;

    	const block = {
    		c: function create() {
    			div4 = element("div");
    			div3 = element("div");
    			div2 = element("div");
    			div0 = element("div");
    			img = element("img");
    			t0 = space();
    			div1 = element("div");
    			h1 = element("h1");
    			h1.textContent = "Yoya Coffee";
    			t2 = space();
    			p = element("p");
    			p.textContent = "Sip The spirit of connection!";
    			if (!src_url_equal(img.src, img_src_value = "/images/yoya-logo-transparent.png?v=" + Date.now())) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "Yoya Coffee Logo");
    			attr_dev(img, "class", "w-full h-full object-contain animate-bounce-slow svelte-1uob4xv");
    			add_location(img, file$1, 29, 10, 1054);
    			attr_dev(div0, "class", "relative w-48 h-48 mb-2");
    			add_location(div0, file$1, 28, 8, 1006);
    			attr_dev(h1, "class", "font-serif text-3xl md:text-4xl font-bold mb-1 animate-reveal svelte-1uob4xv");
    			add_location(h1, file$1, 38, 10, 1363);
    			attr_dev(p, "class", "text-sm text-cream-200 tracking-wider italic font-light animate-reveal-delay svelte-1uob4xv");
    			add_location(p, file$1, 41, 10, 1488);
    			attr_dev(div1, "class", "text-center");
    			add_location(div1, file$1, 37, 8, 1327);
    			attr_dev(div2, "class", "flex flex-col items-center");
    			add_location(div2, file$1, 27, 6, 957);
    			attr_dev(div3, "class", "w-full max-w-sm transform transition-all animate-fade-in-up svelte-1uob4xv");
    			add_location(div3, file$1, 25, 4, 851);
    			attr_dev(div4, "class", div4_class_value = "fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-gradient-to-br from-coffee-900 via-coffee-800 to-coffee-700 text-white transition-opacity duration-500 ease-in-out " + (/*fadeOut*/ ctx[1] ? 'opacity-0' : 'opacity-100'));
    			add_location(div4, file$1, 22, 2, 602);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div4, anchor);
    			append_dev(div4, div3);
    			append_dev(div3, div2);
    			append_dev(div2, div0);
    			append_dev(div0, img);
    			append_dev(div2, t0);
    			append_dev(div2, div1);
    			append_dev(div1, h1);
    			append_dev(div1, t2);
    			append_dev(div1, p);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*fadeOut*/ 2 && div4_class_value !== (div4_class_value = "fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-gradient-to-br from-coffee-900 via-coffee-800 to-coffee-700 text-white transition-opacity duration-500 ease-in-out " + (/*fadeOut*/ ctx[1] ? 'opacity-0' : 'opacity-100'))) {
    				attr_dev(div4, "class", div4_class_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div4);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(22:0) {#if visible}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let if_block_anchor;
    	let if_block = /*visible*/ ctx[0] && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*visible*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$1(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('SplashScreen', slots, []);
    	let { duration = 2500 } = $$props;
    	let visible = true;
    	let fadeOut = false;

    	// When component mounts, set a timeout to hide the splash screen
    	onMount(() => {
    		// Start fade out animation after specified duration
    		setTimeout(
    			() => {
    				$$invalidate(1, fadeOut = true);
    			},
    			duration - 500
    		); // Start fade-out animation 500ms before hiding

    		// Hide splash screen completely after the full duration
    		setTimeout(
    			() => {
    				$$invalidate(0, visible = false);
    			},
    			duration
    		);
    	});

    	const writable_props = ['duration'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<SplashScreen> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('duration' in $$props) $$invalidate(2, duration = $$props.duration);
    	};

    	$$self.$capture_state = () => ({ onMount, duration, visible, fadeOut });

    	$$self.$inject_state = $$props => {
    		if ('duration' in $$props) $$invalidate(2, duration = $$props.duration);
    		if ('visible' in $$props) $$invalidate(0, visible = $$props.visible);
    		if ('fadeOut' in $$props) $$invalidate(1, fadeOut = $$props.fadeOut);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [visible, fadeOut, duration];
    }

    class SplashScreen extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { duration: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SplashScreen",
    			options,
    			id: create_fragment$1.name
    		});
    	}

    	get duration() {
    		throw new Error("<SplashScreen>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set duration(value) {
    		throw new Error("<SplashScreen>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\App.svelte generated by Svelte v3.59.2 */

    const { Error: Error_1, console: console_1 } = globals;
    const file = "src\\App.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[21] = list[i];
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[24] = list[i];
    	return child_ctx;
    }

    // (188:6) {#if !isMobile}
    function create_if_block_8(ctx) {
    	let aside;
    	let div;
    	let categoryfilter;
    	let current;

    	categoryfilter = new CategoryFilter({
    			props: {
    				categories: /*categories*/ ctx[2],
    				activeCategory: /*activeCategory*/ ctx[5]
    			},
    			$$inline: true
    		});

    	categoryfilter.$on("selectCategory", /*handleCategorySelect*/ ctx[8]);

    	const block = {
    		c: function create() {
    			aside = element("aside");
    			div = element("div");
    			create_component(categoryfilter.$$.fragment);
    			attr_dev(div, "class", "sticky top-4");
    			add_location(div, file, 189, 10, 5894);
    			attr_dev(aside, "class", "w-full md:w-64 shrink-0");
    			add_location(aside, file, 188, 8, 5844);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, aside, anchor);
    			append_dev(aside, div);
    			mount_component(categoryfilter, div, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const categoryfilter_changes = {};
    			if (dirty & /*categories*/ 4) categoryfilter_changes.categories = /*categories*/ ctx[2];
    			if (dirty & /*activeCategory*/ 32) categoryfilter_changes.activeCategory = /*activeCategory*/ ctx[5];
    			categoryfilter.$set(categoryfilter_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(categoryfilter.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(categoryfilter.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(aside);
    			destroy_component(categoryfilter);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_8.name,
    		type: "if",
    		source: "(188:6) {#if !isMobile}",
    		ctx
    	});

    	return block;
    }

    // (247:67) 
    function create_if_block_7(ctx) {
    	let div;
    	let svg;
    	let path;
    	let t0;
    	let p0;
    	let t1;
    	let t2;
    	let t3;
    	let t4;
    	let p1;

    	const block = {
    		c: function create() {
    			div = element("div");
    			svg = svg_element("svg");
    			path = svg_element("path");
    			t0 = space();
    			p0 = element("p");
    			t1 = text("No items found matching \"");
    			t2 = text(/*searchQuery*/ ctx[0]);
    			t3 = text("\"");
    			t4 = space();
    			p1 = element("p");
    			p1.textContent = "Try a different search term or browse our menu categories";
    			attr_dev(path, "stroke-linecap", "round");
    			attr_dev(path, "stroke-linejoin", "round");
    			attr_dev(path, "stroke-width", "2");
    			attr_dev(path, "d", "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z");
    			add_location(path, file, 249, 14, 9915);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "class", "h-12 w-12 mx-auto text-coffee-300 mb-4");
    			attr_dev(svg, "fill", "none");
    			attr_dev(svg, "viewBox", "0 0 24 24");
    			attr_dev(svg, "stroke", "currentColor");
    			add_location(svg, file, 248, 12, 9759);
    			attr_dev(p0, "class", "text-coffee-600 text-lg");
    			add_location(p0, file, 251, 12, 10067);
    			attr_dev(p1, "class", "text-coffee-400 mt-2");
    			add_location(p1, file, 252, 12, 10158);
    			attr_dev(div, "class", "mt-6 text-center p-8 bg-white rounded-2xl shadow-soft");
    			add_location(div, file, 247, 10, 9679);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, svg);
    			append_dev(svg, path);
    			append_dev(div, t0);
    			append_dev(div, p0);
    			append_dev(p0, t1);
    			append_dev(p0, t2);
    			append_dev(p0, t3);
    			append_dev(div, t4);
    			append_dev(div, p1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*searchQuery*/ 1) set_data_dev(t2, /*searchQuery*/ ctx[0]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_7.name,
    		type: "if",
    		source: "(247:67) ",
    		ctx
    	});

    	return block;
    }

    // (205:8) {#if searchQuery.trim() && searchResults.length > 0}
    function create_if_block_6(ctx) {
    	let div1;
    	let h2;
    	let t1;
    	let div0;
    	let each_value_1 = /*searchResults*/ ctx[1];
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			h2 = element("h2");
    			h2.textContent = "Search Results";
    			t1 = space();
    			div0 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(h2, "class", "text-2xl font-semibold text-coffee-800 mb-4 font-serif");
    			add_location(h2, file, 206, 12, 6393);
    			attr_dev(div0, "class", "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6");
    			add_location(div0, file, 207, 12, 6492);
    			attr_dev(div1, "class", "mt-6");
    			add_location(div1, file, 205, 10, 6362);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, h2);
    			append_dev(div1, t1);
    			append_dev(div1, div0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(div0, null);
    				}
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*searchResults*/ 2) {
    				each_value_1 = /*searchResults*/ ctx[1];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div0, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_1.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_6.name,
    		type: "if",
    		source: "(205:8) {#if searchQuery.trim() && searchResults.length > 0}",
    		ctx
    	});

    	return block;
    }

    // (209:14) {#each searchResults as item}
    function create_each_block_1(ctx) {
    	let div9;
    	let div0;
    	let img;
    	let img_src_value;
    	let img_alt_value;
    	let t0;
    	let div8;
    	let div3;
    	let div1;
    	let h3;
    	let t1_value = /*item*/ ctx[24].name + "";
    	let t1;
    	let t2;
    	let p;
    	let t3_value = /*item*/ ctx[24].description + "";
    	let t3;
    	let t4;
    	let div2;
    	let svg0;
    	let path0;
    	let t5;
    	let span0;
    	let t6_value = /*item*/ ctx[24].rating + "";
    	let t6;
    	let t7;
    	let div4;
    	let t8;
    	let div7;
    	let div5;
    	let span1;
    	let t9_value = /*item*/ ctx[24].price + "";
    	let t9;
    	let t10;
    	let t11;
    	let div6;
    	let svg1;
    	let path1;
    	let t12;
    	let span2;
    	let t13_value = /*item*/ ctx[24].rating + "";
    	let t13;
    	let t14;

    	const block = {
    		c: function create() {
    			div9 = element("div");
    			div0 = element("div");
    			img = element("img");
    			t0 = space();
    			div8 = element("div");
    			div3 = element("div");
    			div1 = element("div");
    			h3 = element("h3");
    			t1 = text(t1_value);
    			t2 = space();
    			p = element("p");
    			t3 = text(t3_value);
    			t4 = space();
    			div2 = element("div");
    			svg0 = svg_element("svg");
    			path0 = svg_element("path");
    			t5 = space();
    			span0 = element("span");
    			t6 = text(t6_value);
    			t7 = space();
    			div4 = element("div");
    			t8 = space();
    			div7 = element("div");
    			div5 = element("div");
    			span1 = element("span");
    			t9 = text(t9_value);
    			t10 = text(" ETB");
    			t11 = space();
    			div6 = element("div");
    			svg1 = svg_element("svg");
    			path1 = svg_element("path");
    			t12 = space();
    			span2 = element("span");
    			t13 = text(t13_value);
    			t14 = space();
    			if (!src_url_equal(img.src, img_src_value = /*item*/ ctx[24].image)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", img_alt_value = /*item*/ ctx[24].name);
    			attr_dev(img, "class", "w-full h-full object-cover transition-transform duration-700 group-hover:scale-110");
    			add_location(img, file, 212, 20, 6908);
    			attr_dev(div0, "class", "w-full h-48 overflow-hidden");
    			add_location(div0, file, 211, 18, 6846);
    			attr_dev(h3, "class", "font-semibold text-lg text-coffee-800");
    			add_location(h3, file, 217, 24, 7240);
    			attr_dev(p, "class", "text-coffee-600 text-sm mt-1 line-clamp-2");
    			add_location(p, file, 218, 24, 7331);
    			attr_dev(div1, "class", "flex-1 pr-3");
    			add_location(div1, file, 216, 22, 7190);
    			attr_dev(path0, "d", "M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z");
    			add_location(path0, file, 223, 26, 7734);
    			attr_dev(svg0, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg0, "class", "h-4 w-4 text-yellow-500");
    			attr_dev(svg0, "viewBox", "0 0 20 20");
    			attr_dev(svg0, "fill", "currentColor");
    			add_location(svg0, file, 222, 24, 7595);
    			attr_dev(span0, "class", "ml-1 text-sm font-medium text-coffee-800");
    			add_location(span0, file, 225, 24, 8148);
    			attr_dev(div2, "class", "flex items-center bg-amber-50 px-2 py-1 rounded-full");
    			add_location(div2, file, 221, 22, 7504);
    			attr_dev(div3, "class", "flex justify-between items-start");
    			add_location(div3, file, 215, 20, 7121);
    			attr_dev(div4, "class", "my-4 h-px bg-gradient-to-r from-transparent via-coffee-200 to-transparent");
    			add_location(div4, file, 228, 20, 8300);
    			attr_dev(span1, "class", "text-coffee-800 font-bold text-lg");
    			add_location(span1, file, 231, 24, 8536);
    			attr_dev(div5, "class", "flex flex-col");
    			add_location(div5, file, 230, 22, 8484);
    			attr_dev(path1, "d", "M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z");
    			add_location(path1, file, 236, 26, 8949);
    			attr_dev(svg1, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg1, "class", "h-4 w-4 text-yellow-500");
    			attr_dev(svg1, "viewBox", "0 0 20 20");
    			attr_dev(svg1, "fill", "currentColor");
    			add_location(svg1, file, 235, 24, 8810);
    			attr_dev(span2, "class", "ml-1 text-sm font-medium text-coffee-800");
    			add_location(span2, file, 238, 24, 9363);
    			attr_dev(div6, "class", "flex items-center bg-amber-50 px-3 py-1 rounded-full");
    			add_location(div6, file, 234, 22, 8719);
    			attr_dev(div7, "class", "flex justify-between items-center");
    			add_location(div7, file, 229, 20, 8414);
    			attr_dev(div8, "class", "p-5");
    			add_location(div8, file, 214, 18, 7083);
    			attr_dev(div9, "class", "menu-item group bg-white rounded-2xl shadow-soft overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-coffee-100");
    			add_location(div9, file, 209, 16, 6619);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div9, anchor);
    			append_dev(div9, div0);
    			append_dev(div0, img);
    			append_dev(div9, t0);
    			append_dev(div9, div8);
    			append_dev(div8, div3);
    			append_dev(div3, div1);
    			append_dev(div1, h3);
    			append_dev(h3, t1);
    			append_dev(div1, t2);
    			append_dev(div1, p);
    			append_dev(p, t3);
    			append_dev(div3, t4);
    			append_dev(div3, div2);
    			append_dev(div2, svg0);
    			append_dev(svg0, path0);
    			append_dev(div2, t5);
    			append_dev(div2, span0);
    			append_dev(span0, t6);
    			append_dev(div8, t7);
    			append_dev(div8, div4);
    			append_dev(div8, t8);
    			append_dev(div8, div7);
    			append_dev(div7, div5);
    			append_dev(div5, span1);
    			append_dev(span1, t9);
    			append_dev(span1, t10);
    			append_dev(div7, t11);
    			append_dev(div7, div6);
    			append_dev(div6, svg1);
    			append_dev(svg1, path1);
    			append_dev(div6, t12);
    			append_dev(div6, span2);
    			append_dev(span2, t13);
    			append_dev(div9, t14);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*searchResults*/ 2 && !src_url_equal(img.src, img_src_value = /*item*/ ctx[24].image)) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*searchResults*/ 2 && img_alt_value !== (img_alt_value = /*item*/ ctx[24].name)) {
    				attr_dev(img, "alt", img_alt_value);
    			}

    			if (dirty & /*searchResults*/ 2 && t1_value !== (t1_value = /*item*/ ctx[24].name + "")) set_data_dev(t1, t1_value);
    			if (dirty & /*searchResults*/ 2 && t3_value !== (t3_value = /*item*/ ctx[24].description + "")) set_data_dev(t3, t3_value);
    			if (dirty & /*searchResults*/ 2 && t6_value !== (t6_value = /*item*/ ctx[24].rating + "")) set_data_dev(t6, t6_value);
    			if (dirty & /*searchResults*/ 2 && t9_value !== (t9_value = /*item*/ ctx[24].price + "")) set_data_dev(t9, t9_value);
    			if (dirty & /*searchResults*/ 2 && t13_value !== (t13_value = /*item*/ ctx[24].rating + "")) set_data_dev(t13, t13_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div9);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(209:14) {#each searchResults as item}",
    		ctx
    	});

    	return block;
    }

    // (258:8) {#if isMobile}
    function create_if_block_5(ctx) {
    	let div;
    	let categoryfilter;
    	let current;

    	categoryfilter = new CategoryFilter({
    			props: {
    				categories: /*categories*/ ctx[2],
    				activeCategory: /*activeCategory*/ ctx[5],
    				isMobile: true
    			},
    			$$inline: true
    		});

    	categoryfilter.$on("selectCategory", /*handleCategorySelect*/ ctx[8]);

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(categoryfilter.$$.fragment);
    			attr_dev(div, "class", "mb-6");
    			add_location(div, file, 258, 10, 10369);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(categoryfilter, div, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const categoryfilter_changes = {};
    			if (dirty & /*categories*/ 4) categoryfilter_changes.categories = /*categories*/ ctx[2];
    			if (dirty & /*activeCategory*/ 32) categoryfilter_changes.activeCategory = /*activeCategory*/ ctx[5];
    			categoryfilter.$set(categoryfilter_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(categoryfilter.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(categoryfilter.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(categoryfilter);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5.name,
    		type: "if",
    		source: "(258:8) {#if isMobile}",
    		ctx
    	});

    	return block;
    }

    // (270:8) {#if !searchQuery.trim()}
    function create_if_block_1(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block_2, create_if_block_3, create_if_block_4, create_else_block];
    	const if_blocks = [];

    	function select_block_type_1(ctx, dirty) {
    		if (/*isLoading*/ ctx[3]) return 0;
    		if (/*loadingError*/ ctx[4]) return 1;
    		if (/*categories*/ ctx[2].length === 0) return 2;
    		return 3;
    	}

    	current_block_type_index = select_block_type_1(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type_1(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(270:8) {#if !searchQuery.trim()}",
    		ctx
    	});

    	return block;
    }

    // (304:10) {:else}
    function create_else_block(ctx) {
    	let div;
    	let current;
    	let each_value = /*categories*/ ctx[2];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "class", "space-y-12");
    			add_location(div, file, 304, 12, 12868);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(div, null);
    				}
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*categories*/ 4) {
    				each_value = /*categories*/ ctx[2];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(304:10) {:else}",
    		ctx
    	});

    	return block;
    }

    // (296:44) 
    function create_if_block_4(ctx) {
    	let div;
    	let svg;
    	let path;
    	let t0;
    	let h3;
    	let t2;
    	let p;

    	const block = {
    		c: function create() {
    			div = element("div");
    			svg = svg_element("svg");
    			path = svg_element("path");
    			t0 = space();
    			h3 = element("h3");
    			h3.textContent = "No Menu Categories Found";
    			t2 = space();
    			p = element("p");
    			p.textContent = "Our menu is being updated. Please check back soon!";
    			attr_dev(path, "stroke-linecap", "round");
    			attr_dev(path, "stroke-linejoin", "round");
    			attr_dev(path, "stroke-width", "2");
    			attr_dev(path, "d", "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z");
    			add_location(path, file, 298, 16, 12317);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "class", "h-12 w-12 mx-auto text-coffee-300 mb-4");
    			attr_dev(svg, "fill", "none");
    			attr_dev(svg, "viewBox", "0 0 24 24");
    			attr_dev(svg, "stroke", "currentColor");
    			add_location(svg, file, 297, 14, 12159);
    			attr_dev(h3, "class", "text-xl font-semibold text-coffee-800 mb-2");
    			add_location(h3, file, 300, 14, 12638);
    			attr_dev(p, "class", "text-coffee-600");
    			add_location(p, file, 301, 14, 12737);
    			attr_dev(div, "class", "mt-8 p-8 bg-white rounded-2xl shadow-md text-center");
    			add_location(div, file, 296, 12, 12079);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, svg);
    			append_dev(svg, path);
    			append_dev(div, t0);
    			append_dev(div, h3);
    			append_dev(div, t2);
    			append_dev(div, p);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4.name,
    		type: "if",
    		source: "(296:44) ",
    		ctx
    	});

    	return block;
    }

    // (280:33) 
    function create_if_block_3(ctx) {
    	let div1;
    	let div0;
    	let svg;
    	let path;
    	let t0;
    	let h3;
    	let t2;
    	let p;
    	let t3;
    	let t4;
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			svg = svg_element("svg");
    			path = svg_element("path");
    			t0 = space();
    			h3 = element("h3");
    			h3.textContent = "Error Loading Menu";
    			t2 = space();
    			p = element("p");
    			t3 = text(/*loadingError*/ ctx[4]);
    			t4 = space();
    			button = element("button");
    			button.textContent = "Retry";
    			attr_dev(path, "stroke-linecap", "round");
    			attr_dev(path, "stroke-linejoin", "round");
    			attr_dev(path, "stroke-width", "2");
    			attr_dev(path, "d", "M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z");
    			add_location(path, file, 283, 18, 11451);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "class", "h-6 w-6 mr-2");
    			attr_dev(svg, "fill", "none");
    			attr_dev(svg, "viewBox", "0 0 24 24");
    			attr_dev(svg, "stroke", "currentColor");
    			add_location(svg, file, 282, 16, 11317);
    			attr_dev(h3, "class", "font-medium");
    			add_location(h3, file, 285, 16, 11617);
    			attr_dev(div0, "class", "flex items-center text-red-600 mb-4");
    			add_location(div0, file, 281, 14, 11251);
    			attr_dev(p, "class", "text-coffee-700 mb-4");
    			add_location(p, file, 287, 14, 11700);
    			attr_dev(button, "class", "px-4 py-2 bg-coffee-600 text-white rounded-lg hover:bg-coffee-700 transition-colors");
    			add_location(button, file, 288, 14, 11765);
    			attr_dev(div1, "class", "mt-8 p-6 bg-white rounded-2xl shadow-md border border-red-100");
    			add_location(div1, file, 280, 12, 11161);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div0, svg);
    			append_dev(svg, path);
    			append_dev(div0, t0);
    			append_dev(div0, h3);
    			append_dev(div1, t2);
    			append_dev(div1, p);
    			append_dev(p, t3);
    			append_dev(div1, t4);
    			append_dev(div1, button);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*click_handler*/ ctx[11], false, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*loadingError*/ 16) set_data_dev(t3, /*loadingError*/ ctx[4]);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(280:33) ",
    		ctx
    	});

    	return block;
    }

    // (271:10) {#if isLoading}
    function create_if_block_2(ctx) {
    	let div4;
    	let div3;
    	let div1;
    	let div0;
    	let t0;
    	let div2;

    	const block = {
    		c: function create() {
    			div4 = element("div");
    			div3 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			t0 = space();
    			div2 = element("div");
    			div2.textContent = "Loading menu...";
    			attr_dev(div0, "class", "coffee-loading svelte-5a7tol");
    			add_location(div0, file, 274, 18, 10944);
    			attr_dev(div1, "class", "absolute top-0 left-0 w-full h-full");
    			add_location(div1, file, 273, 16, 10876);
    			attr_dev(div2, "class", "mt-28 text-coffee-700");
    			add_location(div2, file, 276, 16, 11018);
    			attr_dev(div3, "class", "inline-block relative w-20 h-20");
    			add_location(div3, file, 272, 14, 10814);
    			attr_dev(div4, "class", "py-12 text-center");
    			add_location(div4, file, 271, 12, 10768);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div4, anchor);
    			append_dev(div4, div3);
    			append_dev(div3, div1);
    			append_dev(div1, div0);
    			append_dev(div3, t0);
    			append_dev(div3, div2);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div4);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(271:10) {#if isLoading}",
    		ctx
    	});

    	return block;
    }

    // (306:14) {#each categories as category}
    function create_each_block(ctx) {
    	let div;
    	let menucategory;
    	let t;
    	let div_id_value;
    	let current;

    	menucategory = new MenuCategory({
    			props: { category: /*category*/ ctx[21] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(menucategory.$$.fragment);
    			t = space();
    			attr_dev(div, "id", div_id_value = /*category*/ ctx[21].id);
    			add_location(div, file, 306, 16, 12954);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(menucategory, div, null);
    			append_dev(div, t);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const menucategory_changes = {};
    			if (dirty & /*categories*/ 4) menucategory_changes.category = /*category*/ ctx[21];
    			menucategory.$set(menucategory_changes);

    			if (!current || dirty & /*categories*/ 4 && div_id_value !== (div_id_value = /*category*/ ctx[21].id)) {
    				attr_dev(div, "id", div_id_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(menucategory.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(menucategory.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(menucategory);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(306:14) {#each categories as category}",
    		ctx
    	});

    	return block;
    }

    // (327:2) {#if currentMode === 'payment'}
    function create_if_block(ctx) {
    	let div16;
    	let div15;
    	let div0;
    	let h2;
    	let t1;
    	let button0;
    	let svg;
    	let path;
    	let t2;
    	let div14;
    	let div3;
    	let div1;
    	let span0;
    	let t4;
    	let div2;
    	let h30;
    	let t6;
    	let p0;
    	let t8;
    	let div7;
    	let div4;
    	let span1;
    	let t10;
    	let div5;
    	let h31;
    	let t12;
    	let p1;
    	let t14;
    	let div6;
    	let img;
    	let img_src_value;
    	let t15;
    	let div10;
    	let div8;
    	let span2;
    	let t17;
    	let div9;
    	let h32;
    	let t19;
    	let p2;
    	let t21;
    	let div13;
    	let div11;
    	let span3;
    	let t23;
    	let div12;
    	let h33;
    	let t25;
    	let p3;
    	let t27;
    	let button1;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div16 = element("div");
    			div15 = element("div");
    			div0 = element("div");
    			h2 = element("h2");
    			h2.textContent = "Payment Options";
    			t1 = space();
    			button0 = element("button");
    			svg = svg_element("svg");
    			path = svg_element("path");
    			t2 = space();
    			div14 = element("div");
    			div3 = element("div");
    			div1 = element("div");
    			span0 = element("span");
    			span0.textContent = "💳";
    			t4 = space();
    			div2 = element("div");
    			h30 = element("h3");
    			h30.textContent = "Credit/Debit Card";
    			t6 = space();
    			p0 = element("p");
    			p0.textContent = "Pay with any major card";
    			t8 = space();
    			div7 = element("div");
    			div4 = element("div");
    			span1 = element("span");
    			span1.textContent = "📱";
    			t10 = space();
    			div5 = element("div");
    			h31 = element("h3");
    			h31.textContent = "Telebirr";
    			t12 = space();
    			p1 = element("p");
    			p1.textContent = "Scan with Telebirr app to pay";
    			t14 = space();
    			div6 = element("div");
    			img = element("img");
    			t15 = space();
    			div10 = element("div");
    			div8 = element("div");
    			span2 = element("span");
    			span2.textContent = "🏦";
    			t17 = space();
    			div9 = element("div");
    			h32 = element("h3");
    			h32.textContent = "CBE Money Account";
    			t19 = space();
    			p2 = element("p");
    			p2.textContent = "Account Number: 1000123456789";
    			t21 = space();
    			div13 = element("div");
    			div11 = element("div");
    			span3 = element("span");
    			span3.textContent = "💵";
    			t23 = space();
    			div12 = element("div");
    			h33 = element("h3");
    			h33.textContent = "Cash";
    			t25 = space();
    			p3 = element("p");
    			p3.textContent = "Pay in-store with cash";
    			t27 = space();
    			button1 = element("button");
    			button1.textContent = "Return to Menu";
    			attr_dev(h2, "class", "text-2xl font-bold text-coffee-800");
    			add_location(h2, file, 330, 10, 13695);
    			attr_dev(path, "stroke-linecap", "round");
    			attr_dev(path, "stroke-linejoin", "round");
    			attr_dev(path, "stroke-width", "2");
    			attr_dev(path, "d", "M6 18L18 6M6 6l12 12");
    			add_location(path, file, 336, 14, 14058);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "class", "h-6 w-6");
    			attr_dev(svg, "fill", "none");
    			attr_dev(svg, "viewBox", "0 0 24 24");
    			attr_dev(svg, "stroke", "currentColor");
    			add_location(svg, file, 335, 12, 13933);
    			attr_dev(button0, "class", "text-coffee-500 hover:text-coffee-700 transition-colors");
    			add_location(button0, file, 331, 10, 13773);
    			attr_dev(div0, "class", "flex justify-between items-center mb-6");
    			add_location(div0, file, 329, 8, 13632);
    			attr_dev(span0, "class", "text-2xl");
    			add_location(span0, file, 344, 14, 14411);
    			attr_dev(div1, "class", "flex-shrink-0 mr-4 bg-coffee-100 p-3 rounded-full");
    			add_location(div1, file, 343, 12, 14333);
    			attr_dev(h30, "class", "font-medium text-coffee-800");
    			add_location(h30, file, 347, 14, 14495);
    			attr_dev(p0, "class", "text-coffee-600 text-sm");
    			add_location(p0, file, 348, 14, 14572);
    			add_location(div2, file, 346, 12, 14475);
    			attr_dev(div3, "class", "flex items-center p-4 bg-coffee-50 rounded-xl");
    			add_location(div3, file, 342, 10, 14261);
    			attr_dev(span1, "class", "text-2xl");
    			add_location(span1, file, 354, 14, 14842);
    			attr_dev(div4, "class", "flex-shrink-0 mr-4 bg-coffee-100 p-3 rounded-full");
    			add_location(div4, file, 353, 12, 14764);
    			attr_dev(h31, "class", "font-medium text-coffee-800");
    			add_location(h31, file, 357, 14, 14941);
    			attr_dev(p1, "class", "text-coffee-600 text-sm");
    			add_location(p1, file, 358, 14, 15009);
    			attr_dev(div5, "class", "flex-1");
    			add_location(div5, file, 356, 12, 14906);
    			if (!src_url_equal(img.src, img_src_value = "/images/payment/telebirr-qr.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "Telebirr QR Code");
    			attr_dev(img, "class", "w-24 h-24 rounded-lg border border-coffee-100");
    			add_location(img, file, 361, 14, 15156);
    			attr_dev(div6, "class", "flex-shrink-0 ml-2");
    			add_location(div6, file, 360, 12, 15109);
    			attr_dev(div7, "class", "flex items-center p-4 bg-coffee-50 rounded-xl");
    			add_location(div7, file, 352, 10, 14692);
    			attr_dev(span2, "class", "text-2xl");
    			add_location(span2, file, 367, 14, 15486);
    			attr_dev(div8, "class", "flex-shrink-0 mr-4 bg-coffee-100 p-3 rounded-full");
    			add_location(div8, file, 366, 12, 15408);
    			attr_dev(h32, "class", "font-medium text-coffee-800");
    			add_location(h32, file, 370, 14, 15570);
    			attr_dev(p2, "class", "text-coffee-600 text-sm");
    			add_location(p2, file, 371, 14, 15647);
    			add_location(div9, file, 369, 12, 15550);
    			attr_dev(div10, "class", "flex items-center p-4 bg-coffee-50 rounded-xl");
    			add_location(div10, file, 365, 10, 15336);
    			attr_dev(span3, "class", "text-2xl");
    			add_location(span3, file, 377, 14, 15923);
    			attr_dev(div11, "class", "flex-shrink-0 mr-4 bg-coffee-100 p-3 rounded-full");
    			add_location(div11, file, 376, 12, 15845);
    			attr_dev(h33, "class", "font-medium text-coffee-800");
    			add_location(h33, file, 380, 14, 16007);
    			attr_dev(p3, "class", "text-coffee-600 text-sm");
    			add_location(p3, file, 381, 14, 16071);
    			add_location(div12, file, 379, 12, 15987);
    			attr_dev(div13, "class", "flex items-center p-4 bg-coffee-50 rounded-xl");
    			add_location(div13, file, 375, 10, 15773);
    			attr_dev(div14, "class", "space-y-4");
    			add_location(div14, file, 341, 8, 14227);
    			attr_dev(button1, "class", "mt-6 w-full py-3 bg-coffee-700 text-white font-medium rounded-xl hover:bg-coffee-800 transition-colors");
    			add_location(button1, file, 386, 8, 16201);
    			attr_dev(div15, "class", "bg-white rounded-2xl shadow-2xl p-8 max-w-lg w-full mx-4 transform transition-all duration-300 animate-fadeIn svelte-5a7tol");
    			add_location(div15, file, 328, 6, 13500);
    			attr_dev(div16, "class", "fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center");
    			add_location(div16, file, 327, 4, 13405);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div16, anchor);
    			append_dev(div16, div15);
    			append_dev(div15, div0);
    			append_dev(div0, h2);
    			append_dev(div0, t1);
    			append_dev(div0, button0);
    			append_dev(button0, svg);
    			append_dev(svg, path);
    			append_dev(div15, t2);
    			append_dev(div15, div14);
    			append_dev(div14, div3);
    			append_dev(div3, div1);
    			append_dev(div1, span0);
    			append_dev(div3, t4);
    			append_dev(div3, div2);
    			append_dev(div2, h30);
    			append_dev(div2, t6);
    			append_dev(div2, p0);
    			append_dev(div14, t8);
    			append_dev(div14, div7);
    			append_dev(div7, div4);
    			append_dev(div4, span1);
    			append_dev(div7, t10);
    			append_dev(div7, div5);
    			append_dev(div5, h31);
    			append_dev(div5, t12);
    			append_dev(div5, p1);
    			append_dev(div7, t14);
    			append_dev(div7, div6);
    			append_dev(div6, img);
    			append_dev(div14, t15);
    			append_dev(div14, div10);
    			append_dev(div10, div8);
    			append_dev(div8, span2);
    			append_dev(div10, t17);
    			append_dev(div10, div9);
    			append_dev(div9, h32);
    			append_dev(div9, t19);
    			append_dev(div9, p2);
    			append_dev(div14, t21);
    			append_dev(div14, div13);
    			append_dev(div13, div11);
    			append_dev(div11, span3);
    			append_dev(div13, t23);
    			append_dev(div13, div12);
    			append_dev(div12, h33);
    			append_dev(div12, t25);
    			append_dev(div12, p3);
    			append_dev(div15, t27);
    			append_dev(div15, button1);

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", /*click_handler_1*/ ctx[13], false, false, false, false),
    					listen_dev(button1, "click", /*click_handler_2*/ ctx[14], false, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div16);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(327:2) {#if currentMode === 'payment'}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let splashscreen;
    	let t0;
    	let div2;
    	let header;
    	let t1;
    	let main;
    	let div1;
    	let t2;
    	let div0;
    	let search;
    	let updating_searchQuery;
    	let t3;
    	let show_if_1;
    	let show_if_2;
    	let t4;
    	let t5;
    	let show_if = !/*searchQuery*/ ctx[0].trim();
    	let t6;
    	let footer;
    	let t7;
    	let musicplayer;
    	let t8;
    	let modetoggle;
    	let updating_mode;
    	let t9;
    	let current;

    	splashscreen = new SplashScreen({
    			props: { duration: 2500 },
    			$$inline: true
    		});

    	header = new Header({ $$inline: true });
    	let if_block0 = !/*isMobile*/ ctx[6] && create_if_block_8(ctx);

    	function search_searchQuery_binding(value) {
    		/*search_searchQuery_binding*/ ctx[10](value);
    	}

    	let search_props = {};

    	if (/*searchQuery*/ ctx[0] !== void 0) {
    		search_props.searchQuery = /*searchQuery*/ ctx[0];
    	}

    	search = new Search({ props: search_props, $$inline: true });
    	binding_callbacks.push(() => bind(search, 'searchQuery', search_searchQuery_binding));

    	function select_block_type(ctx, dirty) {
    		if (dirty & /*searchQuery, searchResults*/ 3) show_if_1 = null;
    		if (dirty & /*searchQuery, searchResults*/ 3) show_if_2 = null;
    		if (show_if_1 == null) show_if_1 = !!(/*searchQuery*/ ctx[0].trim() && /*searchResults*/ ctx[1].length > 0);
    		if (show_if_1) return create_if_block_6;
    		if (show_if_2 == null) show_if_2 = !!(/*searchQuery*/ ctx[0].trim() && /*searchResults*/ ctx[1].length === 0);
    		if (show_if_2) return create_if_block_7;
    	}

    	let current_block_type = select_block_type(ctx, -1);
    	let if_block1 = current_block_type && current_block_type(ctx);
    	let if_block2 = /*isMobile*/ ctx[6] && create_if_block_5(ctx);
    	let if_block3 = show_if && create_if_block_1(ctx);
    	footer = new Footer({ $$inline: true });
    	musicplayer = new MusicPlayer({ $$inline: true });

    	function modetoggle_mode_binding(value) {
    		/*modetoggle_mode_binding*/ ctx[12](value);
    	}

    	let modetoggle_props = {};

    	if (/*currentMode*/ ctx[7] !== void 0) {
    		modetoggle_props.mode = /*currentMode*/ ctx[7];
    	}

    	modetoggle = new ModeToggle({ props: modetoggle_props, $$inline: true });
    	binding_callbacks.push(() => bind(modetoggle, 'mode', modetoggle_mode_binding));
    	modetoggle.$on("modeChange", /*handleModeChange*/ ctx[9]);
    	let if_block4 = /*currentMode*/ ctx[7] === 'payment' && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			create_component(splashscreen.$$.fragment);
    			t0 = space();
    			div2 = element("div");
    			create_component(header.$$.fragment);
    			t1 = space();
    			main = element("main");
    			div1 = element("div");
    			if (if_block0) if_block0.c();
    			t2 = space();
    			div0 = element("div");
    			create_component(search.$$.fragment);
    			t3 = space();
    			if (if_block1) if_block1.c();
    			t4 = space();
    			if (if_block2) if_block2.c();
    			t5 = space();
    			if (if_block3) if_block3.c();
    			t6 = space();
    			create_component(footer.$$.fragment);
    			t7 = space();
    			create_component(musicplayer.$$.fragment);
    			t8 = space();
    			create_component(modetoggle.$$.fragment);
    			t9 = space();
    			if (if_block4) if_block4.c();
    			attr_dev(div0, "class", "flex-1");
    			add_location(div0, file, 199, 6, 6165);
    			attr_dev(div1, "class", "max-w-7xl mx-auto px-4 py-6 flex flex-col md:flex-row gap-6");
    			add_location(div1, file, 185, 4, 5689);
    			attr_dev(main, "class", "flex-1 w-full");
    			add_location(main, file, 184, 2, 5656);
    			attr_dev(div2, "class", "min-h-screen flex flex-col bg-amber-50");
    			add_location(div2, file, 179, 0, 5534);
    		},
    		l: function claim(nodes) {
    			throw new Error_1("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(splashscreen, target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div2, anchor);
    			mount_component(header, div2, null);
    			append_dev(div2, t1);
    			append_dev(div2, main);
    			append_dev(main, div1);
    			if (if_block0) if_block0.m(div1, null);
    			append_dev(div1, t2);
    			append_dev(div1, div0);
    			mount_component(search, div0, null);
    			append_dev(div0, t3);
    			if (if_block1) if_block1.m(div0, null);
    			append_dev(div0, t4);
    			if (if_block2) if_block2.m(div0, null);
    			append_dev(div0, t5);
    			if (if_block3) if_block3.m(div0, null);
    			append_dev(div2, t6);
    			mount_component(footer, div2, null);
    			append_dev(div2, t7);
    			mount_component(musicplayer, div2, null);
    			append_dev(div2, t8);
    			mount_component(modetoggle, div2, null);
    			append_dev(div2, t9);
    			if (if_block4) if_block4.m(div2, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (!/*isMobile*/ ctx[6]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty & /*isMobile*/ 64) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_8(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(div1, t2);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			const search_changes = {};

    			if (!updating_searchQuery && dirty & /*searchQuery*/ 1) {
    				updating_searchQuery = true;
    				search_changes.searchQuery = /*searchQuery*/ ctx[0];
    				add_flush_callback(() => updating_searchQuery = false);
    			}

    			search.$set(search_changes);

    			if (current_block_type === (current_block_type = select_block_type(ctx, dirty)) && if_block1) {
    				if_block1.p(ctx, dirty);
    			} else {
    				if (if_block1) if_block1.d(1);
    				if_block1 = current_block_type && current_block_type(ctx);

    				if (if_block1) {
    					if_block1.c();
    					if_block1.m(div0, t4);
    				}
    			}

    			if (/*isMobile*/ ctx[6]) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);

    					if (dirty & /*isMobile*/ 64) {
    						transition_in(if_block2, 1);
    					}
    				} else {
    					if_block2 = create_if_block_5(ctx);
    					if_block2.c();
    					transition_in(if_block2, 1);
    					if_block2.m(div0, t5);
    				}
    			} else if (if_block2) {
    				group_outros();

    				transition_out(if_block2, 1, 1, () => {
    					if_block2 = null;
    				});

    				check_outros();
    			}

    			if (dirty & /*searchQuery*/ 1) show_if = !/*searchQuery*/ ctx[0].trim();

    			if (show_if) {
    				if (if_block3) {
    					if_block3.p(ctx, dirty);

    					if (dirty & /*searchQuery*/ 1) {
    						transition_in(if_block3, 1);
    					}
    				} else {
    					if_block3 = create_if_block_1(ctx);
    					if_block3.c();
    					transition_in(if_block3, 1);
    					if_block3.m(div0, null);
    				}
    			} else if (if_block3) {
    				group_outros();

    				transition_out(if_block3, 1, 1, () => {
    					if_block3 = null;
    				});

    				check_outros();
    			}

    			const modetoggle_changes = {};

    			if (!updating_mode && dirty & /*currentMode*/ 128) {
    				updating_mode = true;
    				modetoggle_changes.mode = /*currentMode*/ ctx[7];
    				add_flush_callback(() => updating_mode = false);
    			}

    			modetoggle.$set(modetoggle_changes);

    			if (/*currentMode*/ ctx[7] === 'payment') {
    				if (if_block4) {
    					if_block4.p(ctx, dirty);
    				} else {
    					if_block4 = create_if_block(ctx);
    					if_block4.c();
    					if_block4.m(div2, null);
    				}
    			} else if (if_block4) {
    				if_block4.d(1);
    				if_block4 = null;
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(splashscreen.$$.fragment, local);
    			transition_in(header.$$.fragment, local);
    			transition_in(if_block0);
    			transition_in(search.$$.fragment, local);
    			transition_in(if_block2);
    			transition_in(if_block3);
    			transition_in(footer.$$.fragment, local);
    			transition_in(musicplayer.$$.fragment, local);
    			transition_in(modetoggle.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(splashscreen.$$.fragment, local);
    			transition_out(header.$$.fragment, local);
    			transition_out(if_block0);
    			transition_out(search.$$.fragment, local);
    			transition_out(if_block2);
    			transition_out(if_block3);
    			transition_out(footer.$$.fragment, local);
    			transition_out(musicplayer.$$.fragment, local);
    			transition_out(modetoggle.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(splashscreen, detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div2);
    			destroy_component(header);
    			if (if_block0) if_block0.d();
    			destroy_component(search);

    			if (if_block1) {
    				if_block1.d();
    			}

    			if (if_block2) if_block2.d();
    			if (if_block3) if_block3.d();
    			destroy_component(footer);
    			destroy_component(musicplayer);
    			destroy_component(modetoggle);
    			if (if_block4) if_block4.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function organizeItemsByCategory(categories, items) {
    	return categories.map(category => {
    		const categoryItems = items.filter(item => item.categoryId === category.id);

    		return {
    			...category,
    			id: category.id.toString(), // Ensure ID is a string for component compatibility
    			items: categoryItems
    		};
    	});
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	let searchQuery = '';
    	let searchResults = [];
    	let categories = [];
    	let menuItems = [];
    	let isLoading = true;
    	let loadingError = null;
    	let activeCategory = null;
    	let isMobile = false;
    	let currentMode = 'menu';
    	let showSplash = true; // Control the splash screen visibility

    	// Function to fetch all categories from the API
    	async function fetchCategories() {
    		try {
    			// Add a timestamp to prevent caching
    			const timestamp = new Date().getTime();

    			const response = await fetch(`/api/categories?_=${timestamp}`, {
    				headers: {
    					'Accept': 'application/json',
    					'Content-Type': 'application/json',
    					'Cache-Control': 'no-cache, no-store, must-revalidate',
    					'Pragma': 'no-cache',
    					'Expires': '0'
    				}
    			});

    			if (!response.ok) {
    				throw new Error(`Failed to load categories: ${response.statusText}`);
    			}

    			// Try to parse the response as JSON
    			const contentType = response.headers.get('content-type');

    			if (!contentType || !contentType.includes('application/json')) {
    				const text = await response.text();
    				console.error('Server returned non-JSON response:', text);
    				throw new Error('Server returned invalid data format. Please try again later.');
    			}

    			return await response.json();
    		} catch(error) {
    			console.error('Error fetching categories:', error);
    			$$invalidate(4, loadingError = `Error Loading Categories: ${error.message}`);
    			return [];
    		}
    	}

    	// Function to fetch all menu items from the API
    	async function fetchMenuItems() {
    		try {
    			// Add a timestamp to prevent caching
    			const timestamp = new Date().getTime();

    			const response = await fetch(`/api/menu?_=${timestamp}`, {
    				headers: {
    					'Accept': 'application/json',
    					'Content-Type': 'application/json',
    					'Cache-Control': 'no-cache, no-store, must-revalidate',
    					'Pragma': 'no-cache',
    					'Expires': '0'
    				}
    			});

    			if (!response.ok) {
    				throw new Error(`Failed to load menu items: ${response.statusText}`);
    			}

    			// Try to parse the response as JSON
    			const contentType = response.headers.get('content-type');

    			if (!contentType || !contentType.includes('application/json')) {
    				const text = await response.text();
    				console.error('Server returned non-JSON response:', text);
    				throw new Error('Server returned invalid data format. Please try again later.');
    			}

    			return await response.json();
    		} catch(error) {
    			console.error('Error fetching menu items:', error);
    			$$invalidate(4, loadingError = `Error Loading Menu: ${error.message}`);
    			return [];
    		}
    	}

    	// Function to search menu items
    	function searchItems(query) {
    		if (!query) return [];
    		const searchTerm = query.toLowerCase();
    		return menuItems.filter(item => item.name.toLowerCase().includes(searchTerm) || item.description.toLowerCase().includes(searchTerm));
    	}

    	function handleCategorySelect(event) {
    		$$invalidate(5, activeCategory = event.detail.category);

    		// Scroll to the selected category if it's not null
    		if (activeCategory) {
    			const element = document.getElementById(activeCategory);

    			if (element) {
    				element.scrollIntoView({ behavior: 'smooth' });
    			}
    		}
    	}

    	function handleModeChange(event) {
    		$$invalidate(7, currentMode = event.detail.mode);
    	}

    	// Check for mobile screen on mount and window resize
    	onMount(async () => {
    		checkMobileScreen();
    		window.addEventListener('resize', checkMobileScreen);

    		// Fetch data from API
    		$$invalidate(3, isLoading = true);

    		$$invalidate(4, loadingError = null);

    		try {
    			const [categoriesData, menuItemsData] = await Promise.all([fetchCategories(), fetchMenuItems()]);
    			menuItems = menuItemsData;

    			// Organize menu items by category
    			$$invalidate(2, categories = organizeItemsByCategory(categoriesData, menuItemsData));

    			$$invalidate(3, isLoading = false);
    		} catch(error) {
    			console.error('Error loading data:', error);
    			$$invalidate(4, loadingError = error.message);
    			$$invalidate(3, isLoading = false);
    		}

    		return () => {
    			window.removeEventListener('resize', checkMobileScreen);
    		};
    	});

    	function checkMobileScreen() {
    		$$invalidate(6, isMobile = window.innerWidth < 768);
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	function search_searchQuery_binding(value) {
    		searchQuery = value;
    		$$invalidate(0, searchQuery);
    	}

    	const click_handler = () => window.location.reload();

    	function modetoggle_mode_binding(value) {
    		currentMode = value;
    		$$invalidate(7, currentMode);
    	}

    	const click_handler_1 = () => $$invalidate(7, currentMode = 'menu');
    	const click_handler_2 = () => $$invalidate(7, currentMode = 'menu');

    	$$self.$capture_state = () => ({
    		onMount,
    		Header,
    		MenuCategory,
    		Search,
    		Footer,
    		CategoryFilter,
    		MusicPlayer,
    		ModeToggle,
    		SplashScreen,
    		searchQuery,
    		searchResults,
    		categories,
    		menuItems,
    		isLoading,
    		loadingError,
    		activeCategory,
    		isMobile,
    		currentMode,
    		showSplash,
    		fetchCategories,
    		fetchMenuItems,
    		organizeItemsByCategory,
    		searchItems,
    		handleCategorySelect,
    		handleModeChange,
    		checkMobileScreen
    	});

    	$$self.$inject_state = $$props => {
    		if ('searchQuery' in $$props) $$invalidate(0, searchQuery = $$props.searchQuery);
    		if ('searchResults' in $$props) $$invalidate(1, searchResults = $$props.searchResults);
    		if ('categories' in $$props) $$invalidate(2, categories = $$props.categories);
    		if ('menuItems' in $$props) menuItems = $$props.menuItems;
    		if ('isLoading' in $$props) $$invalidate(3, isLoading = $$props.isLoading);
    		if ('loadingError' in $$props) $$invalidate(4, loadingError = $$props.loadingError);
    		if ('activeCategory' in $$props) $$invalidate(5, activeCategory = $$props.activeCategory);
    		if ('isMobile' in $$props) $$invalidate(6, isMobile = $$props.isMobile);
    		if ('currentMode' in $$props) $$invalidate(7, currentMode = $$props.currentMode);
    		if ('showSplash' in $$props) showSplash = $$props.showSplash;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*searchQuery*/ 1) {
    			// Handle search query changes
    			{
    				if (searchQuery.trim()) {
    					$$invalidate(1, searchResults = searchItems(searchQuery));
    				} else {
    					$$invalidate(1, searchResults = []);
    				}
    			}
    		}
    	};

    	return [
    		searchQuery,
    		searchResults,
    		categories,
    		isLoading,
    		loadingError,
    		activeCategory,
    		isMobile,
    		currentMode,
    		handleCategorySelect,
    		handleModeChange,
    		search_searchQuery_binding,
    		click_handler,
    		modetoggle_mode_binding,
    		click_handler_1,
    		click_handler_2
    	];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
            target: document.getElementById('app'),
            props: {}
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
