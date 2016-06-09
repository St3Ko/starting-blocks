define(["exports", "jquery", "state", "pages/home", "abstract-page", "graphicLoader", "abstract-nav"], function (exports, _jquery, _state, _home, _abstractPage, _graphicLoader, _abstractNav) {
    "use strict";

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.Router = undefined;

    var _jquery2 = _interopRequireDefault(_jquery);

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    var _createClass = function () {
        function defineProperties(target, props) {
            for (var i = 0; i < props.length; i++) {
                var descriptor = props[i];
                descriptor.enumerable = descriptor.enumerable || false;
                descriptor.configurable = true;
                if ("value" in descriptor) descriptor.writable = true;
                Object.defineProperty(target, descriptor.key, descriptor);
            }
        }

        return function (Constructor, protoProps, staticProps) {
            if (protoProps) defineProperties(Constructor.prototype, protoProps);
            if (staticProps) defineProperties(Constructor, staticProps);
            return Constructor;
        };
    }();

    var Router = exports.Router = function () {
        /**
         * Create a new Router.
         *
         * Default options list: 
         *
         * * homeHasClass: false,
         * * ajaxEnabled: true,
         * * pageClass: "page-content",
         * * noAjaxLinkClass: "no-ajax-link",
         * * navLinkClass: "nav-link",
         * * activeClass: "active",
         * * pageBlockClass: ".page-block",
         * * $ajaxContainer: $("#ajax-container"),
         * * minLoadDuration: 0,
         * * postLoad: (state, data) => {},
         * * preLoad: (state) => {},
         * * prePushState: (state) => {},
         * * onDestroy: () => {},
         * * preBoot: ($cont, context, isHome) => {},
         *
         * Routes example:
         *
         * ```js
         * {
         *    'page' : Page,
         * }
         * ```
         *
         * @param {Object} options
         * @param {Object} routes
         * @param {String} baseUrl
         * @param {GraphicLoader} loader
         * @param {AbstractNav} nav
         */

        function Router(options, routes, baseUrl, loader, nav) {
            _classCallCheck(this, Router);

            if (!baseUrl) {
                throw "Router needs baseUrl to be defined.";
            }
            if (!loader) {
                throw "Router needs a GraphicLoader instance to be defined.";
            }
            if (!(loader instanceof _graphicLoader.GraphicLoader)) {
                throw "'loader' must be an instance of GraphicLoader.";
            }

            if (!nav) {
                throw "Router needs a Nav instance to be defined.";
            }
            if (!(nav instanceof _abstractNav.AbstractNav)) {
                throw "'nav' must be an instance of Nav.";
            }

            /**
             * @type {String}
             */
            this.baseUrl = baseUrl;
            /**
             * @type {Object}
             */
            this.routes = routes;
            /**
             * @type {GraphicLoader}
             */
            this.loader = loader;
            /**
             * @type {AbstractNav}
             */
            this.nav = nav;
            /**
             * @type {State|null}
             */
            this.state = null;
            /**
             * @type {Array}
             */
            this.formerPages = [];
            /**
             * @type {null}
             */
            this.page = null;
            this.stateBlock = true;
            this.ajaxEnabled = true;
            this.transition = false;
            this.loading = false;
            this.window = (0, _jquery2.default)(window);
            this.currentRequest = null;
            /**
             * @type {Object}
             */
            this.options = {
                homeHasClass: false,
                ajaxEnabled: true,
                pageClass: "page-content",
                noAjaxLinkClass: "no-ajax-link",
                navLinkClass: "nav-link",
                activeClass: "active",
                pageBlockClass: ".page-block",
                $ajaxContainer: (0, _jquery2.default)("#ajax-container"),
                minLoadDuration: 0,
                postLoad: function postLoad(state, data) {},
                preLoad: function preLoad(state) {},
                prePushState: function prePushState(state) {},
                onDestroy: function onDestroy() {},
                preBoot: function preBoot($cont, context, isHome) {}
            };

            if (options !== null) {
                this.options = _jquery2.default.extend(this.options, options);
            }
        }

        _createClass(Router, [{
            key: "destroy",
            value: function destroy() {
                if (this.options.ajaxEnabled) {
                    window.removeEventListener("popstate", this.onPopState.bind(this), false);
                }
                var onDestroyBinded = this.options.onDestroy.bind(this);
                onDestroyBinded();
            }
        }, {
            key: "initEvents",
            value: function initEvents() {
                if (this.options.ajaxEnabled) {
                    window.addEventListener("popstate", this.onPopState.bind(this), false);
                }
                /*
                 * Init nav events
                 */
                this.nav.initEvents(this);
            }
        }, {
            key: "onPopState",
            value: function onPopState(event) {
                console.log(this);
                if (typeof event.state !== "undefined" && event.state !== null) {
                    this.transition = true;
                    this.loadPage(event, event.state);
                }
            }

            /**
             * Booting need a jQuery handler for
             * the container.
             *
             * @param  {jQuery}  $cont
             * @param  {String}  context
             * @param  {Boolean} isHome
             */

        }, {
            key: "boot",
            value: function boot($cont, context, isHome) {
                if (context == 'static') {
                    this.loadBeginDate = new Date();
                }
                var preBootBinded = this.options.preBoot.bind(this);
                preBootBinded($cont, context, isHome);

                var nodeType = $cont.attr('data-node-type');

                if (isHome && this.options.homeHasClass) {
                    this.page = new _home.Home(this, $cont, context, nodeType, isHome);
                } else if (nodeType && typeof this.routes[nodeType] !== 'undefined') {
                    this.page = new this.routes[nodeType](this, $cont, context, nodeType, isHome);
                } else {
                    console.log('Page (' + nodeType + ') has no defined route, using AbstractPage.');
                    this.page = new _abstractPage.AbstractPage(this, $cont, context, nodeType, isHome);
                }
            }

            /**
             *
             * @param e Event
             */

        }, {
            key: "onLinkClick",
            value: function onLinkClick(e) {
                var linkClassName = e.currentTarget.className,
                    linkHref = e.currentTarget.href;

                if (linkHref.indexOf('mailto:') == -1) {
                    e.preventDefault();

                    // Check if link is not active
                    if (linkClassName.indexOf(this.options.activeClass) == -1 && linkClassName.indexOf(this.options.noAjaxLinkClass) == -1 && !this.transition) {
                        this.transition = true;

                        var state = new _state.State(e.currentTarget, {
                            previousType: this.page.type,
                            navLinkClass: this.options.navLinkClass
                        });

                        var prePushStateBinded = this.options.prePushState.bind(this);
                        prePushStateBinded(state);

                        if (history.pushState) {
                            history.pushState(state, state.title, state.href);
                        }
                        this.loadPage(e, state);
                    }
                }
            }

            /**
             *
             * @param e
             * @param state
             */

        }, {
            key: "loadPage",
            value: function loadPage(e, state) {
                var _this = this;

                if (this.currentRequest && this.currentRequest.readyState != 4) {
                    this.currentRequest.abort();
                }
                this.loader.show();
                this.loadBeginDate = new Date();

                var preLoadBinded = this.options.preLoad.bind(this);
                preLoadBinded(state);

                this.currentRequest = _jquery2.default.ajax({
                    url: state.href,
                    dataType: "html",
                    // Need to disable cache to prevent
                    // browser to serve partial when no
                    // ajax context is defined.
                    cache: false,
                    type: 'get',
                    success: function success(data) {
                        // Extract only to new page content
                        // if the whole HTML is queried
                        var $data = null;
                        var $response = (0, _jquery2.default)(_jquery2.default.parseHTML(data.trim()));
                        if ($response.hasClass(_this.options.pageClass)) {
                            $data = $response;
                        } else {
                            $data = $response.find('.' + _this.options.pageClass);
                        }
                        /*
                         * Display data to DOM
                         */
                        _this.options.$ajaxContainer.append($data);

                        /*
                         * Push a copy object not to set it as null.
                         */
                        _this.formerPages.push(_this.page);

                        // Init new page
                        _this.updatePageTitle($data);
                        _this.boot($data, 'ajax', state.isHome);

                        var postLoadBinded = _this.options.postLoad.bind(_this);
                        postLoadBinded(state, $data);

                        // Analytics
                        if (typeof ga !== "undefined") {
                            ga('send', 'pageview', { 'page': state.href, 'title': document.title });
                        }
                    }
                });
            }

            /**
             * Update page title against data-title attribute
             * from ajax loaded partial DOM.
             *
             * @param {jQuery} $data
             */

        }, {
            key: "updatePageTitle",
            value: function updatePageTitle($data) {
                if ($data.length && $data.attr('data-meta-title') !== '') {
                    var metaTitle = $data.attr('data-meta-title');
                    if (metaTitle !== null && metaTitle !== '') document.title = metaTitle;
                }
            }

            /**
             *
             * @param {boolean} isHome
             */

        }, {
            key: "pushFirstState",
            value: function pushFirstState(isHome) {
                if (history.pushState) {
                    history.pushState({
                        'firstPage': true,
                        'href': window.location.href,
                        'isHome': isHome
                    }, null, window.location.href);
                }
            }
        }]);

        return Router;
    }();
});
//# sourceMappingURL=router.js.map
