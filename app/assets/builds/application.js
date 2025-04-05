var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn3, res) => function __init() {
  return fn3 && (res = (0, fn3[__getOwnPropNames(fn3)[0]])(fn3 = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// node_modules/@rails/actioncable/src/adapters.js
var adapters_default;
var init_adapters = __esm({
  "node_modules/@rails/actioncable/src/adapters.js"() {
    adapters_default = {
      logger: typeof console !== "undefined" ? console : void 0,
      WebSocket: typeof WebSocket !== "undefined" ? WebSocket : void 0
    };
  }
});

// node_modules/@rails/actioncable/src/logger.js
var logger_default;
var init_logger = __esm({
  "node_modules/@rails/actioncable/src/logger.js"() {
    init_adapters();
    logger_default = {
      log(...messages) {
        if (this.enabled) {
          messages.push(Date.now());
          adapters_default.logger.log("[ActionCable]", ...messages);
        }
      }
    };
  }
});

// node_modules/@rails/actioncable/src/connection_monitor.js
var now, secondsSince, ConnectionMonitor, connection_monitor_default;
var init_connection_monitor = __esm({
  "node_modules/@rails/actioncable/src/connection_monitor.js"() {
    init_logger();
    now = () => (/* @__PURE__ */ new Date()).getTime();
    secondsSince = (time) => (now() - time) / 1e3;
    ConnectionMonitor = class {
      constructor(connection) {
        this.visibilityDidChange = this.visibilityDidChange.bind(this);
        this.connection = connection;
        this.reconnectAttempts = 0;
      }
      start() {
        if (!this.isRunning()) {
          this.startedAt = now();
          delete this.stoppedAt;
          this.startPolling();
          addEventListener("visibilitychange", this.visibilityDidChange);
          logger_default.log(`ConnectionMonitor started. stale threshold = ${this.constructor.staleThreshold} s`);
        }
      }
      stop() {
        if (this.isRunning()) {
          this.stoppedAt = now();
          this.stopPolling();
          removeEventListener("visibilitychange", this.visibilityDidChange);
          logger_default.log("ConnectionMonitor stopped");
        }
      }
      isRunning() {
        return this.startedAt && !this.stoppedAt;
      }
      recordMessage() {
        this.pingedAt = now();
      }
      recordConnect() {
        this.reconnectAttempts = 0;
        delete this.disconnectedAt;
        logger_default.log("ConnectionMonitor recorded connect");
      }
      recordDisconnect() {
        this.disconnectedAt = now();
        logger_default.log("ConnectionMonitor recorded disconnect");
      }
      // Private
      startPolling() {
        this.stopPolling();
        this.poll();
      }
      stopPolling() {
        clearTimeout(this.pollTimeout);
      }
      poll() {
        this.pollTimeout = setTimeout(
          () => {
            this.reconnectIfStale();
            this.poll();
          },
          this.getPollInterval()
        );
      }
      getPollInterval() {
        const { staleThreshold, reconnectionBackoffRate } = this.constructor;
        const backoff = Math.pow(1 + reconnectionBackoffRate, Math.min(this.reconnectAttempts, 10));
        const jitterMax = this.reconnectAttempts === 0 ? 1 : reconnectionBackoffRate;
        const jitter = jitterMax * Math.random();
        return staleThreshold * 1e3 * backoff * (1 + jitter);
      }
      reconnectIfStale() {
        if (this.connectionIsStale()) {
          logger_default.log(`ConnectionMonitor detected stale connection. reconnectAttempts = ${this.reconnectAttempts}, time stale = ${secondsSince(this.refreshedAt)} s, stale threshold = ${this.constructor.staleThreshold} s`);
          this.reconnectAttempts++;
          if (this.disconnectedRecently()) {
            logger_default.log(`ConnectionMonitor skipping reopening recent disconnect. time disconnected = ${secondsSince(this.disconnectedAt)} s`);
          } else {
            logger_default.log("ConnectionMonitor reopening");
            this.connection.reopen();
          }
        }
      }
      get refreshedAt() {
        return this.pingedAt ? this.pingedAt : this.startedAt;
      }
      connectionIsStale() {
        return secondsSince(this.refreshedAt) > this.constructor.staleThreshold;
      }
      disconnectedRecently() {
        return this.disconnectedAt && secondsSince(this.disconnectedAt) < this.constructor.staleThreshold;
      }
      visibilityDidChange() {
        if (document.visibilityState === "visible") {
          setTimeout(
            () => {
              if (this.connectionIsStale() || !this.connection.isOpen()) {
                logger_default.log(`ConnectionMonitor reopening stale connection on visibilitychange. visibilityState = ${document.visibilityState}`);
                this.connection.reopen();
              }
            },
            200
          );
        }
      }
    };
    ConnectionMonitor.staleThreshold = 6;
    ConnectionMonitor.reconnectionBackoffRate = 0.15;
    connection_monitor_default = ConnectionMonitor;
  }
});

// node_modules/@rails/actioncable/src/internal.js
var internal_default;
var init_internal = __esm({
  "node_modules/@rails/actioncable/src/internal.js"() {
    internal_default = {
      "message_types": {
        "welcome": "welcome",
        "disconnect": "disconnect",
        "ping": "ping",
        "confirmation": "confirm_subscription",
        "rejection": "reject_subscription"
      },
      "disconnect_reasons": {
        "unauthorized": "unauthorized",
        "invalid_request": "invalid_request",
        "server_restart": "server_restart",
        "remote": "remote"
      },
      "default_mount_path": "/cable",
      "protocols": [
        "actioncable-v1-json",
        "actioncable-unsupported"
      ]
    };
  }
});

// node_modules/@rails/actioncable/src/connection.js
var message_types, protocols, supportedProtocols, indexOf, Connection, connection_default;
var init_connection = __esm({
  "node_modules/@rails/actioncable/src/connection.js"() {
    init_adapters();
    init_connection_monitor();
    init_internal();
    init_logger();
    ({ message_types, protocols } = internal_default);
    supportedProtocols = protocols.slice(0, protocols.length - 1);
    indexOf = [].indexOf;
    Connection = class {
      constructor(consumer2) {
        this.open = this.open.bind(this);
        this.consumer = consumer2;
        this.subscriptions = this.consumer.subscriptions;
        this.monitor = new connection_monitor_default(this);
        this.disconnected = true;
      }
      send(data) {
        if (this.isOpen()) {
          this.webSocket.send(JSON.stringify(data));
          return true;
        } else {
          return false;
        }
      }
      open() {
        if (this.isActive()) {
          logger_default.log(`Attempted to open WebSocket, but existing socket is ${this.getState()}`);
          return false;
        } else {
          const socketProtocols = [...protocols, ...this.consumer.subprotocols || []];
          logger_default.log(`Opening WebSocket, current state is ${this.getState()}, subprotocols: ${socketProtocols}`);
          if (this.webSocket) {
            this.uninstallEventHandlers();
          }
          this.webSocket = new adapters_default.WebSocket(this.consumer.url, socketProtocols);
          this.installEventHandlers();
          this.monitor.start();
          return true;
        }
      }
      close({ allowReconnect } = { allowReconnect: true }) {
        if (!allowReconnect) {
          this.monitor.stop();
        }
        if (this.isOpen()) {
          return this.webSocket.close();
        }
      }
      reopen() {
        logger_default.log(`Reopening WebSocket, current state is ${this.getState()}`);
        if (this.isActive()) {
          try {
            return this.close();
          } catch (error2) {
            logger_default.log("Failed to reopen WebSocket", error2);
          } finally {
            logger_default.log(`Reopening WebSocket in ${this.constructor.reopenDelay}ms`);
            setTimeout(this.open, this.constructor.reopenDelay);
          }
        } else {
          return this.open();
        }
      }
      getProtocol() {
        if (this.webSocket) {
          return this.webSocket.protocol;
        }
      }
      isOpen() {
        return this.isState("open");
      }
      isActive() {
        return this.isState("open", "connecting");
      }
      triedToReconnect() {
        return this.monitor.reconnectAttempts > 0;
      }
      // Private
      isProtocolSupported() {
        return indexOf.call(supportedProtocols, this.getProtocol()) >= 0;
      }
      isState(...states) {
        return indexOf.call(states, this.getState()) >= 0;
      }
      getState() {
        if (this.webSocket) {
          for (let state in adapters_default.WebSocket) {
            if (adapters_default.WebSocket[state] === this.webSocket.readyState) {
              return state.toLowerCase();
            }
          }
        }
        return null;
      }
      installEventHandlers() {
        for (let eventName in this.events) {
          const handler = this.events[eventName].bind(this);
          this.webSocket[`on${eventName}`] = handler;
        }
      }
      uninstallEventHandlers() {
        for (let eventName in this.events) {
          this.webSocket[`on${eventName}`] = function() {
          };
        }
      }
    };
    Connection.reopenDelay = 500;
    Connection.prototype.events = {
      message(event) {
        if (!this.isProtocolSupported()) {
          return;
        }
        const { identifier, message, reason, reconnect, type } = JSON.parse(event.data);
        this.monitor.recordMessage();
        switch (type) {
          case message_types.welcome:
            if (this.triedToReconnect()) {
              this.reconnectAttempted = true;
            }
            this.monitor.recordConnect();
            return this.subscriptions.reload();
          case message_types.disconnect:
            logger_default.log(`Disconnecting. Reason: ${reason}`);
            return this.close({ allowReconnect: reconnect });
          case message_types.ping:
            return null;
          case message_types.confirmation:
            this.subscriptions.confirmSubscription(identifier);
            if (this.reconnectAttempted) {
              this.reconnectAttempted = false;
              return this.subscriptions.notify(identifier, "connected", { reconnected: true });
            } else {
              return this.subscriptions.notify(identifier, "connected", { reconnected: false });
            }
          case message_types.rejection:
            return this.subscriptions.reject(identifier);
          default:
            return this.subscriptions.notify(identifier, "received", message);
        }
      },
      open() {
        logger_default.log(`WebSocket onopen event, using '${this.getProtocol()}' subprotocol`);
        this.disconnected = false;
        if (!this.isProtocolSupported()) {
          logger_default.log("Protocol is unsupported. Stopping monitor and disconnecting.");
          return this.close({ allowReconnect: false });
        }
      },
      close(event) {
        logger_default.log("WebSocket onclose event");
        if (this.disconnected) {
          return;
        }
        this.disconnected = true;
        this.monitor.recordDisconnect();
        return this.subscriptions.notifyAll("disconnected", { willAttemptReconnect: this.monitor.isRunning() });
      },
      error() {
        logger_default.log("WebSocket onerror event");
      }
    };
    connection_default = Connection;
  }
});

// node_modules/@rails/actioncable/src/subscription.js
var extend, Subscription;
var init_subscription = __esm({
  "node_modules/@rails/actioncable/src/subscription.js"() {
    extend = function(object, properties) {
      if (properties != null) {
        for (let key in properties) {
          const value = properties[key];
          object[key] = value;
        }
      }
      return object;
    };
    Subscription = class {
      constructor(consumer2, params = {}, mixin) {
        this.consumer = consumer2;
        this.identifier = JSON.stringify(params);
        extend(this, mixin);
      }
      // Perform a channel action with the optional data passed as an attribute
      perform(action, data = {}) {
        data.action = action;
        return this.send(data);
      }
      send(data) {
        return this.consumer.send({ command: "message", identifier: this.identifier, data: JSON.stringify(data) });
      }
      unsubscribe() {
        return this.consumer.subscriptions.remove(this);
      }
    };
  }
});

// node_modules/@rails/actioncable/src/subscription_guarantor.js
var SubscriptionGuarantor, subscription_guarantor_default;
var init_subscription_guarantor = __esm({
  "node_modules/@rails/actioncable/src/subscription_guarantor.js"() {
    init_logger();
    SubscriptionGuarantor = class {
      constructor(subscriptions) {
        this.subscriptions = subscriptions;
        this.pendingSubscriptions = [];
      }
      guarantee(subscription) {
        if (this.pendingSubscriptions.indexOf(subscription) == -1) {
          logger_default.log(`SubscriptionGuarantor guaranteeing ${subscription.identifier}`);
          this.pendingSubscriptions.push(subscription);
        } else {
          logger_default.log(`SubscriptionGuarantor already guaranteeing ${subscription.identifier}`);
        }
        this.startGuaranteeing();
      }
      forget(subscription) {
        logger_default.log(`SubscriptionGuarantor forgetting ${subscription.identifier}`);
        this.pendingSubscriptions = this.pendingSubscriptions.filter((s2) => s2 !== subscription);
      }
      startGuaranteeing() {
        this.stopGuaranteeing();
        this.retrySubscribing();
      }
      stopGuaranteeing() {
        clearTimeout(this.retryTimeout);
      }
      retrySubscribing() {
        this.retryTimeout = setTimeout(
          () => {
            if (this.subscriptions && typeof this.subscriptions.subscribe === "function") {
              this.pendingSubscriptions.map((subscription) => {
                logger_default.log(`SubscriptionGuarantor resubscribing ${subscription.identifier}`);
                this.subscriptions.subscribe(subscription);
              });
            }
          },
          500
        );
      }
    };
    subscription_guarantor_default = SubscriptionGuarantor;
  }
});

// node_modules/@rails/actioncable/src/subscriptions.js
var Subscriptions;
var init_subscriptions = __esm({
  "node_modules/@rails/actioncable/src/subscriptions.js"() {
    init_subscription();
    init_subscription_guarantor();
    init_logger();
    Subscriptions = class {
      constructor(consumer2) {
        this.consumer = consumer2;
        this.guarantor = new subscription_guarantor_default(this);
        this.subscriptions = [];
      }
      create(channelName, mixin) {
        const channel = channelName;
        const params = typeof channel === "object" ? channel : { channel };
        const subscription = new Subscription(this.consumer, params, mixin);
        return this.add(subscription);
      }
      // Private
      add(subscription) {
        this.subscriptions.push(subscription);
        this.consumer.ensureActiveConnection();
        this.notify(subscription, "initialized");
        this.subscribe(subscription);
        return subscription;
      }
      remove(subscription) {
        this.forget(subscription);
        if (!this.findAll(subscription.identifier).length) {
          this.sendCommand(subscription, "unsubscribe");
        }
        return subscription;
      }
      reject(identifier) {
        return this.findAll(identifier).map((subscription) => {
          this.forget(subscription);
          this.notify(subscription, "rejected");
          return subscription;
        });
      }
      forget(subscription) {
        this.guarantor.forget(subscription);
        this.subscriptions = this.subscriptions.filter((s2) => s2 !== subscription);
        return subscription;
      }
      findAll(identifier) {
        return this.subscriptions.filter((s2) => s2.identifier === identifier);
      }
      reload() {
        return this.subscriptions.map((subscription) => this.subscribe(subscription));
      }
      notifyAll(callbackName, ...args) {
        return this.subscriptions.map((subscription) => this.notify(subscription, callbackName, ...args));
      }
      notify(subscription, callbackName, ...args) {
        let subscriptions;
        if (typeof subscription === "string") {
          subscriptions = this.findAll(subscription);
        } else {
          subscriptions = [subscription];
        }
        return subscriptions.map((subscription2) => typeof subscription2[callbackName] === "function" ? subscription2[callbackName](...args) : void 0);
      }
      subscribe(subscription) {
        if (this.sendCommand(subscription, "subscribe")) {
          this.guarantor.guarantee(subscription);
        }
      }
      confirmSubscription(identifier) {
        logger_default.log(`Subscription confirmed ${identifier}`);
        this.findAll(identifier).map((subscription) => this.guarantor.forget(subscription));
      }
      sendCommand(subscription, command) {
        const { identifier } = subscription;
        return this.consumer.send({ command, identifier });
      }
    };
  }
});

// node_modules/@rails/actioncable/src/consumer.js
function createWebSocketURL(url) {
  if (typeof url === "function") {
    url = url();
  }
  if (url && !/^wss?:/i.test(url)) {
    const a2 = document.createElement("a");
    a2.href = url;
    a2.href = a2.href;
    a2.protocol = a2.protocol.replace("http", "ws");
    return a2.href;
  } else {
    return url;
  }
}
var Consumer;
var init_consumer = __esm({
  "node_modules/@rails/actioncable/src/consumer.js"() {
    init_connection();
    init_subscriptions();
    Consumer = class {
      constructor(url) {
        this._url = url;
        this.subscriptions = new Subscriptions(this);
        this.connection = new connection_default(this);
        this.subprotocols = [];
      }
      get url() {
        return createWebSocketURL(this._url);
      }
      send(data) {
        return this.connection.send(data);
      }
      connect() {
        return this.connection.open();
      }
      disconnect() {
        return this.connection.close({ allowReconnect: false });
      }
      ensureActiveConnection() {
        if (!this.connection.isActive()) {
          return this.connection.open();
        }
      }
      addSubProtocol(subprotocol) {
        this.subprotocols = [...this.subprotocols, subprotocol];
      }
    };
  }
});

// node_modules/@rails/actioncable/src/index.js
var src_exports = {};
__export(src_exports, {
  Connection: () => connection_default,
  ConnectionMonitor: () => connection_monitor_default,
  Consumer: () => Consumer,
  INTERNAL: () => internal_default,
  Subscription: () => Subscription,
  SubscriptionGuarantor: () => subscription_guarantor_default,
  Subscriptions: () => Subscriptions,
  adapters: () => adapters_default,
  createConsumer: () => createConsumer,
  createWebSocketURL: () => createWebSocketURL,
  getConfig: () => getConfig,
  logger: () => logger_default
});
function createConsumer(url = getConfig("url") || internal_default.default_mount_path) {
  return new Consumer(url);
}
function getConfig(name) {
  const element = document.head.querySelector(`meta[name='action-cable-${name}']`);
  if (element) {
    return element.getAttribute("content");
  }
}
var init_src = __esm({
  "node_modules/@rails/actioncable/src/index.js"() {
    init_connection();
    init_connection_monitor();
    init_consumer();
    init_internal();
    init_subscription();
    init_subscriptions();
    init_subscription_guarantor();
    init_adapters();
    init_logger();
  }
});

// node_modules/@hotwired/turbo/dist/turbo.es2017-esm.js
var turbo_es2017_esm_exports = {};
__export(turbo_es2017_esm_exports, {
  FetchEnctype: () => FetchEnctype,
  FetchMethod: () => FetchMethod,
  FetchRequest: () => FetchRequest,
  FetchResponse: () => FetchResponse,
  FrameElement: () => FrameElement,
  FrameLoadingStyle: () => FrameLoadingStyle,
  FrameRenderer: () => FrameRenderer,
  PageRenderer: () => PageRenderer,
  PageSnapshot: () => PageSnapshot,
  StreamActions: () => StreamActions,
  StreamElement: () => StreamElement,
  StreamSourceElement: () => StreamSourceElement,
  cache: () => cache,
  clearCache: () => clearCache,
  config: () => config,
  connectStreamSource: () => connectStreamSource,
  disconnectStreamSource: () => disconnectStreamSource,
  fetch: () => fetchWithTurboHeaders,
  fetchEnctypeFromString: () => fetchEnctypeFromString,
  fetchMethodFromString: () => fetchMethodFromString,
  isSafe: () => isSafe,
  navigator: () => navigator$1,
  registerAdapter: () => registerAdapter,
  renderStreamMessage: () => renderStreamMessage,
  session: () => session,
  setConfirmMethod: () => setConfirmMethod,
  setFormMode: () => setFormMode,
  setProgressBarDelay: () => setProgressBarDelay,
  start: () => start,
  visit: () => visit
});
(function(prototype) {
  if (typeof prototype.requestSubmit == "function") return;
  prototype.requestSubmit = function(submitter2) {
    if (submitter2) {
      validateSubmitter(submitter2, this);
      submitter2.click();
    } else {
      submitter2 = document.createElement("input");
      submitter2.type = "submit";
      submitter2.hidden = true;
      this.appendChild(submitter2);
      submitter2.click();
      this.removeChild(submitter2);
    }
  };
  function validateSubmitter(submitter2, form) {
    submitter2 instanceof HTMLElement || raise(TypeError, "parameter 1 is not of type 'HTMLElement'");
    submitter2.type == "submit" || raise(TypeError, "The specified element is not a submit button");
    submitter2.form == form || raise(DOMException, "The specified element is not owned by this form element", "NotFoundError");
  }
  function raise(errorConstructor, message, name) {
    throw new errorConstructor("Failed to execute 'requestSubmit' on 'HTMLFormElement': " + message + ".", name);
  }
})(HTMLFormElement.prototype);
var submittersByForm = /* @__PURE__ */ new WeakMap();
function findSubmitterFromClickTarget(target) {
  const element = target instanceof Element ? target : target instanceof Node ? target.parentElement : null;
  const candidate = element ? element.closest("input, button") : null;
  return candidate?.type == "submit" ? candidate : null;
}
function clickCaptured(event) {
  const submitter2 = findSubmitterFromClickTarget(event.target);
  if (submitter2 && submitter2.form) {
    submittersByForm.set(submitter2.form, submitter2);
  }
}
(function() {
  if ("submitter" in Event.prototype) return;
  let prototype = window.Event.prototype;
  if ("SubmitEvent" in window) {
    const prototypeOfSubmitEvent = window.SubmitEvent.prototype;
    if (/Apple Computer/.test(navigator.vendor) && !("submitter" in prototypeOfSubmitEvent)) {
      prototype = prototypeOfSubmitEvent;
    } else {
      return;
    }
  }
  addEventListener("click", clickCaptured, true);
  Object.defineProperty(prototype, "submitter", {
    get() {
      if (this.type == "submit" && this.target instanceof HTMLFormElement) {
        return submittersByForm.get(this.target);
      }
    }
  });
})();
var FrameLoadingStyle = {
  eager: "eager",
  lazy: "lazy"
};
var FrameElement = class _FrameElement extends HTMLElement {
  static delegateConstructor = void 0;
  loaded = Promise.resolve();
  static get observedAttributes() {
    return ["disabled", "loading", "src"];
  }
  constructor() {
    super();
    this.delegate = new _FrameElement.delegateConstructor(this);
  }
  connectedCallback() {
    this.delegate.connect();
  }
  disconnectedCallback() {
    this.delegate.disconnect();
  }
  reload() {
    return this.delegate.sourceURLReloaded();
  }
  attributeChangedCallback(name) {
    if (name == "loading") {
      this.delegate.loadingStyleChanged();
    } else if (name == "src") {
      this.delegate.sourceURLChanged();
    } else if (name == "disabled") {
      this.delegate.disabledChanged();
    }
  }
  /**
   * Gets the URL to lazily load source HTML from
   */
  get src() {
    return this.getAttribute("src");
  }
  /**
   * Sets the URL to lazily load source HTML from
   */
  set src(value) {
    if (value) {
      this.setAttribute("src", value);
    } else {
      this.removeAttribute("src");
    }
  }
  /**
   * Gets the refresh mode for the frame.
   */
  get refresh() {
    return this.getAttribute("refresh");
  }
  /**
   * Sets the refresh mode for the frame.
   */
  set refresh(value) {
    if (value) {
      this.setAttribute("refresh", value);
    } else {
      this.removeAttribute("refresh");
    }
  }
  get shouldReloadWithMorph() {
    return this.src && this.refresh === "morph";
  }
  /**
   * Determines if the element is loading
   */
  get loading() {
    return frameLoadingStyleFromString(this.getAttribute("loading") || "");
  }
  /**
   * Sets the value of if the element is loading
   */
  set loading(value) {
    if (value) {
      this.setAttribute("loading", value);
    } else {
      this.removeAttribute("loading");
    }
  }
  /**
   * Gets the disabled state of the frame.
   *
   * If disabled, no requests will be intercepted by the frame.
   */
  get disabled() {
    return this.hasAttribute("disabled");
  }
  /**
   * Sets the disabled state of the frame.
   *
   * If disabled, no requests will be intercepted by the frame.
   */
  set disabled(value) {
    if (value) {
      this.setAttribute("disabled", "");
    } else {
      this.removeAttribute("disabled");
    }
  }
  /**
   * Gets the autoscroll state of the frame.
   *
   * If true, the frame will be scrolled into view automatically on update.
   */
  get autoscroll() {
    return this.hasAttribute("autoscroll");
  }
  /**
   * Sets the autoscroll state of the frame.
   *
   * If true, the frame will be scrolled into view automatically on update.
   */
  set autoscroll(value) {
    if (value) {
      this.setAttribute("autoscroll", "");
    } else {
      this.removeAttribute("autoscroll");
    }
  }
  /**
   * Determines if the element has finished loading
   */
  get complete() {
    return !this.delegate.isLoading;
  }
  /**
   * Gets the active state of the frame.
   *
   * If inactive, source changes will not be observed.
   */
  get isActive() {
    return this.ownerDocument === document && !this.isPreview;
  }
  /**
   * Sets the active state of the frame.
   *
   * If inactive, source changes will not be observed.
   */
  get isPreview() {
    return this.ownerDocument?.documentElement?.hasAttribute("data-turbo-preview");
  }
};
function frameLoadingStyleFromString(style) {
  switch (style.toLowerCase()) {
    case "lazy":
      return FrameLoadingStyle.lazy;
    default:
      return FrameLoadingStyle.eager;
  }
}
var drive = {
  enabled: true,
  progressBarDelay: 500,
  unvisitableExtensions: /* @__PURE__ */ new Set(
    [
      ".7z",
      ".aac",
      ".apk",
      ".avi",
      ".bmp",
      ".bz2",
      ".css",
      ".csv",
      ".deb",
      ".dmg",
      ".doc",
      ".docx",
      ".exe",
      ".gif",
      ".gz",
      ".heic",
      ".heif",
      ".ico",
      ".iso",
      ".jpeg",
      ".jpg",
      ".js",
      ".json",
      ".m4a",
      ".mkv",
      ".mov",
      ".mp3",
      ".mp4",
      ".mpeg",
      ".mpg",
      ".msi",
      ".ogg",
      ".ogv",
      ".pdf",
      ".pkg",
      ".png",
      ".ppt",
      ".pptx",
      ".rar",
      ".rtf",
      ".svg",
      ".tar",
      ".tif",
      ".tiff",
      ".txt",
      ".wav",
      ".webm",
      ".webp",
      ".wma",
      ".wmv",
      ".xls",
      ".xlsx",
      ".xml",
      ".zip"
    ]
  )
};
function activateScriptElement(element) {
  if (element.getAttribute("data-turbo-eval") == "false") {
    return element;
  } else {
    const createdScriptElement = document.createElement("script");
    const cspNonce = getCspNonce();
    if (cspNonce) {
      createdScriptElement.nonce = cspNonce;
    }
    createdScriptElement.textContent = element.textContent;
    createdScriptElement.async = false;
    copyElementAttributes(createdScriptElement, element);
    return createdScriptElement;
  }
}
function copyElementAttributes(destinationElement, sourceElement) {
  for (const { name, value } of sourceElement.attributes) {
    destinationElement.setAttribute(name, value);
  }
}
function createDocumentFragment(html) {
  const template = document.createElement("template");
  template.innerHTML = html;
  return template.content;
}
function dispatch(eventName, { target, cancelable, detail } = {}) {
  const event = new CustomEvent(eventName, {
    cancelable,
    bubbles: true,
    composed: true,
    detail
  });
  if (target && target.isConnected) {
    target.dispatchEvent(event);
  } else {
    document.documentElement.dispatchEvent(event);
  }
  return event;
}
function cancelEvent(event) {
  event.preventDefault();
  event.stopImmediatePropagation();
}
function nextRepaint() {
  if (document.visibilityState === "hidden") {
    return nextEventLoopTick();
  } else {
    return nextAnimationFrame();
  }
}
function nextAnimationFrame() {
  return new Promise((resolve) => requestAnimationFrame(() => resolve()));
}
function nextEventLoopTick() {
  return new Promise((resolve) => setTimeout(() => resolve(), 0));
}
function nextMicrotask() {
  return Promise.resolve();
}
function parseHTMLDocument(html = "") {
  return new DOMParser().parseFromString(html, "text/html");
}
function unindent(strings, ...values) {
  const lines = interpolate(strings, values).replace(/^\n/, "").split("\n");
  const match = lines[0].match(/^\s+/);
  const indent = match ? match[0].length : 0;
  return lines.map((line) => line.slice(indent)).join("\n");
}
function interpolate(strings, values) {
  return strings.reduce((result, string, i2) => {
    const value = values[i2] == void 0 ? "" : values[i2];
    return result + string + value;
  }, "");
}
function uuid() {
  return Array.from({ length: 36 }).map((_2, i2) => {
    if (i2 == 8 || i2 == 13 || i2 == 18 || i2 == 23) {
      return "-";
    } else if (i2 == 14) {
      return "4";
    } else if (i2 == 19) {
      return (Math.floor(Math.random() * 4) + 8).toString(16);
    } else {
      return Math.floor(Math.random() * 15).toString(16);
    }
  }).join("");
}
function getAttribute(attributeName, ...elements) {
  for (const value of elements.map((element) => element?.getAttribute(attributeName))) {
    if (typeof value == "string") return value;
  }
  return null;
}
function hasAttribute(attributeName, ...elements) {
  return elements.some((element) => element && element.hasAttribute(attributeName));
}
function markAsBusy(...elements) {
  for (const element of elements) {
    if (element.localName == "turbo-frame") {
      element.setAttribute("busy", "");
    }
    element.setAttribute("aria-busy", "true");
  }
}
function clearBusyState(...elements) {
  for (const element of elements) {
    if (element.localName == "turbo-frame") {
      element.removeAttribute("busy");
    }
    element.removeAttribute("aria-busy");
  }
}
function waitForLoad(element, timeoutInMilliseconds = 2e3) {
  return new Promise((resolve) => {
    const onComplete = () => {
      element.removeEventListener("error", onComplete);
      element.removeEventListener("load", onComplete);
      resolve();
    };
    element.addEventListener("load", onComplete, { once: true });
    element.addEventListener("error", onComplete, { once: true });
    setTimeout(resolve, timeoutInMilliseconds);
  });
}
function getHistoryMethodForAction(action) {
  switch (action) {
    case "replace":
      return history.replaceState;
    case "advance":
    case "restore":
      return history.pushState;
  }
}
function isAction(action) {
  return action == "advance" || action == "replace" || action == "restore";
}
function getVisitAction(...elements) {
  const action = getAttribute("data-turbo-action", ...elements);
  return isAction(action) ? action : null;
}
function getMetaElement(name) {
  return document.querySelector(`meta[name="${name}"]`);
}
function getMetaContent(name) {
  const element = getMetaElement(name);
  return element && element.content;
}
function getCspNonce() {
  const element = getMetaElement("csp-nonce");
  if (element) {
    const { nonce, content } = element;
    return nonce == "" ? content : nonce;
  }
}
function setMetaContent(name, content) {
  let element = getMetaElement(name);
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute("name", name);
    document.head.appendChild(element);
  }
  element.setAttribute("content", content);
  return element;
}
function findClosestRecursively(element, selector) {
  if (element instanceof Element) {
    return element.closest(selector) || findClosestRecursively(element.assignedSlot || element.getRootNode()?.host, selector);
  }
}
function elementIsFocusable(element) {
  const inertDisabledOrHidden = "[inert], :disabled, [hidden], details:not([open]), dialog:not([open])";
  return !!element && element.closest(inertDisabledOrHidden) == null && typeof element.focus == "function";
}
function queryAutofocusableElement(elementOrDocumentFragment) {
  return Array.from(elementOrDocumentFragment.querySelectorAll("[autofocus]")).find(elementIsFocusable);
}
async function around(callback, reader) {
  const before = reader();
  callback();
  await nextAnimationFrame();
  const after = reader();
  return [before, after];
}
function doesNotTargetIFrame(name) {
  if (name === "_blank") {
    return false;
  } else if (name) {
    for (const element of document.getElementsByName(name)) {
      if (element instanceof HTMLIFrameElement) return false;
    }
    return true;
  } else {
    return true;
  }
}
function findLinkFromClickTarget(target) {
  return findClosestRecursively(target, "a[href]:not([target^=_]):not([download])");
}
function getLocationForLink(link) {
  return expandURL(link.getAttribute("href") || "");
}
function debounce(fn3, delay) {
  let timeoutId = null;
  return (...args) => {
    const callback = () => fn3.apply(this, args);
    clearTimeout(timeoutId);
    timeoutId = setTimeout(callback, delay);
  };
}
var submitter = {
  "aria-disabled": {
    beforeSubmit: (submitter2) => {
      submitter2.setAttribute("aria-disabled", "true");
      submitter2.addEventListener("click", cancelEvent);
    },
    afterSubmit: (submitter2) => {
      submitter2.removeAttribute("aria-disabled");
      submitter2.removeEventListener("click", cancelEvent);
    }
  },
  "disabled": {
    beforeSubmit: (submitter2) => submitter2.disabled = true,
    afterSubmit: (submitter2) => submitter2.disabled = false
  }
};
var Config = class {
  #submitter = null;
  constructor(config2) {
    Object.assign(this, config2);
  }
  get submitter() {
    return this.#submitter;
  }
  set submitter(value) {
    this.#submitter = submitter[value] || value;
  }
};
var forms = new Config({
  mode: "on",
  submitter: "disabled"
});
var config = {
  drive,
  forms
};
function expandURL(locatable) {
  return new URL(locatable.toString(), document.baseURI);
}
function getAnchor(url) {
  let anchorMatch;
  if (url.hash) {
    return url.hash.slice(1);
  } else if (anchorMatch = url.href.match(/#(.*)$/)) {
    return anchorMatch[1];
  }
}
function getAction$1(form, submitter2) {
  const action = submitter2?.getAttribute("formaction") || form.getAttribute("action") || form.action;
  return expandURL(action);
}
function getExtension(url) {
  return (getLastPathComponent(url).match(/\.[^.]*$/) || [])[0] || "";
}
function isPrefixedBy(baseURL, url) {
  const prefix = getPrefix(url);
  return baseURL.href === expandURL(prefix).href || baseURL.href.startsWith(prefix);
}
function locationIsVisitable(location2, rootLocation) {
  return isPrefixedBy(location2, rootLocation) && !config.drive.unvisitableExtensions.has(getExtension(location2));
}
function getRequestURL(url) {
  const anchor = getAnchor(url);
  return anchor != null ? url.href.slice(0, -(anchor.length + 1)) : url.href;
}
function toCacheKey(url) {
  return getRequestURL(url);
}
function urlsAreEqual(left2, right2) {
  return expandURL(left2).href == expandURL(right2).href;
}
function getPathComponents(url) {
  return url.pathname.split("/").slice(1);
}
function getLastPathComponent(url) {
  return getPathComponents(url).slice(-1)[0];
}
function getPrefix(url) {
  return addTrailingSlash(url.origin + url.pathname);
}
function addTrailingSlash(value) {
  return value.endsWith("/") ? value : value + "/";
}
var FetchResponse = class {
  constructor(response) {
    this.response = response;
  }
  get succeeded() {
    return this.response.ok;
  }
  get failed() {
    return !this.succeeded;
  }
  get clientError() {
    return this.statusCode >= 400 && this.statusCode <= 499;
  }
  get serverError() {
    return this.statusCode >= 500 && this.statusCode <= 599;
  }
  get redirected() {
    return this.response.redirected;
  }
  get location() {
    return expandURL(this.response.url);
  }
  get isHTML() {
    return this.contentType && this.contentType.match(/^(?:text\/([^\s;,]+\b)?html|application\/xhtml\+xml)\b/);
  }
  get statusCode() {
    return this.response.status;
  }
  get contentType() {
    return this.header("Content-Type");
  }
  get responseText() {
    return this.response.clone().text();
  }
  get responseHTML() {
    if (this.isHTML) {
      return this.response.clone().text();
    } else {
      return Promise.resolve(void 0);
    }
  }
  header(name) {
    return this.response.headers.get(name);
  }
};
var LimitedSet = class extends Set {
  constructor(maxSize) {
    super();
    this.maxSize = maxSize;
  }
  add(value) {
    if (this.size >= this.maxSize) {
      const iterator = this.values();
      const oldestValue = iterator.next().value;
      this.delete(oldestValue);
    }
    super.add(value);
  }
};
var recentRequests = new LimitedSet(20);
var nativeFetch = window.fetch;
function fetchWithTurboHeaders(url, options = {}) {
  const modifiedHeaders = new Headers(options.headers || {});
  const requestUID = uuid();
  recentRequests.add(requestUID);
  modifiedHeaders.append("X-Turbo-Request-Id", requestUID);
  return nativeFetch(url, {
    ...options,
    headers: modifiedHeaders
  });
}
function fetchMethodFromString(method) {
  switch (method.toLowerCase()) {
    case "get":
      return FetchMethod.get;
    case "post":
      return FetchMethod.post;
    case "put":
      return FetchMethod.put;
    case "patch":
      return FetchMethod.patch;
    case "delete":
      return FetchMethod.delete;
  }
}
var FetchMethod = {
  get: "get",
  post: "post",
  put: "put",
  patch: "patch",
  delete: "delete"
};
function fetchEnctypeFromString(encoding) {
  switch (encoding.toLowerCase()) {
    case FetchEnctype.multipart:
      return FetchEnctype.multipart;
    case FetchEnctype.plain:
      return FetchEnctype.plain;
    default:
      return FetchEnctype.urlEncoded;
  }
}
var FetchEnctype = {
  urlEncoded: "application/x-www-form-urlencoded",
  multipart: "multipart/form-data",
  plain: "text/plain"
};
var FetchRequest = class {
  abortController = new AbortController();
  #resolveRequestPromise = (_value) => {
  };
  constructor(delegate, method, location2, requestBody = new URLSearchParams(), target = null, enctype = FetchEnctype.urlEncoded) {
    const [url, body] = buildResourceAndBody(expandURL(location2), method, requestBody, enctype);
    this.delegate = delegate;
    this.url = url;
    this.target = target;
    this.fetchOptions = {
      credentials: "same-origin",
      redirect: "follow",
      method: method.toUpperCase(),
      headers: { ...this.defaultHeaders },
      body,
      signal: this.abortSignal,
      referrer: this.delegate.referrer?.href
    };
    this.enctype = enctype;
  }
  get method() {
    return this.fetchOptions.method;
  }
  set method(value) {
    const fetchBody = this.isSafe ? this.url.searchParams : this.fetchOptions.body || new FormData();
    const fetchMethod = fetchMethodFromString(value) || FetchMethod.get;
    this.url.search = "";
    const [url, body] = buildResourceAndBody(this.url, fetchMethod, fetchBody, this.enctype);
    this.url = url;
    this.fetchOptions.body = body;
    this.fetchOptions.method = fetchMethod.toUpperCase();
  }
  get headers() {
    return this.fetchOptions.headers;
  }
  set headers(value) {
    this.fetchOptions.headers = value;
  }
  get body() {
    if (this.isSafe) {
      return this.url.searchParams;
    } else {
      return this.fetchOptions.body;
    }
  }
  set body(value) {
    this.fetchOptions.body = value;
  }
  get location() {
    return this.url;
  }
  get params() {
    return this.url.searchParams;
  }
  get entries() {
    return this.body ? Array.from(this.body.entries()) : [];
  }
  cancel() {
    this.abortController.abort();
  }
  async perform() {
    const { fetchOptions } = this;
    this.delegate.prepareRequest(this);
    const event = await this.#allowRequestToBeIntercepted(fetchOptions);
    try {
      this.delegate.requestStarted(this);
      if (event.detail.fetchRequest) {
        this.response = event.detail.fetchRequest.response;
      } else {
        this.response = fetchWithTurboHeaders(this.url.href, fetchOptions);
      }
      const response = await this.response;
      return await this.receive(response);
    } catch (error2) {
      if (error2.name !== "AbortError") {
        if (this.#willDelegateErrorHandling(error2)) {
          this.delegate.requestErrored(this, error2);
        }
        throw error2;
      }
    } finally {
      this.delegate.requestFinished(this);
    }
  }
  async receive(response) {
    const fetchResponse = new FetchResponse(response);
    const event = dispatch("turbo:before-fetch-response", {
      cancelable: true,
      detail: { fetchResponse },
      target: this.target
    });
    if (event.defaultPrevented) {
      this.delegate.requestPreventedHandlingResponse(this, fetchResponse);
    } else if (fetchResponse.succeeded) {
      this.delegate.requestSucceededWithResponse(this, fetchResponse);
    } else {
      this.delegate.requestFailedWithResponse(this, fetchResponse);
    }
    return fetchResponse;
  }
  get defaultHeaders() {
    return {
      Accept: "text/html, application/xhtml+xml"
    };
  }
  get isSafe() {
    return isSafe(this.method);
  }
  get abortSignal() {
    return this.abortController.signal;
  }
  acceptResponseType(mimeType) {
    this.headers["Accept"] = [mimeType, this.headers["Accept"]].join(", ");
  }
  async #allowRequestToBeIntercepted(fetchOptions) {
    const requestInterception = new Promise((resolve) => this.#resolveRequestPromise = resolve);
    const event = dispatch("turbo:before-fetch-request", {
      cancelable: true,
      detail: {
        fetchOptions,
        url: this.url,
        resume: this.#resolveRequestPromise
      },
      target: this.target
    });
    this.url = event.detail.url;
    if (event.defaultPrevented) await requestInterception;
    return event;
  }
  #willDelegateErrorHandling(error2) {
    const event = dispatch("turbo:fetch-request-error", {
      target: this.target,
      cancelable: true,
      detail: { request: this, error: error2 }
    });
    return !event.defaultPrevented;
  }
};
function isSafe(fetchMethod) {
  return fetchMethodFromString(fetchMethod) == FetchMethod.get;
}
function buildResourceAndBody(resource, method, requestBody, enctype) {
  const searchParams = Array.from(requestBody).length > 0 ? new URLSearchParams(entriesExcludingFiles(requestBody)) : resource.searchParams;
  if (isSafe(method)) {
    return [mergeIntoURLSearchParams(resource, searchParams), null];
  } else if (enctype == FetchEnctype.urlEncoded) {
    return [resource, searchParams];
  } else {
    return [resource, requestBody];
  }
}
function entriesExcludingFiles(requestBody) {
  const entries = [];
  for (const [name, value] of requestBody) {
    if (value instanceof File) continue;
    else entries.push([name, value]);
  }
  return entries;
}
function mergeIntoURLSearchParams(url, requestBody) {
  const searchParams = new URLSearchParams(entriesExcludingFiles(requestBody));
  url.search = searchParams.toString();
  return url;
}
var AppearanceObserver = class {
  started = false;
  constructor(delegate, element) {
    this.delegate = delegate;
    this.element = element;
    this.intersectionObserver = new IntersectionObserver(this.intersect);
  }
  start() {
    if (!this.started) {
      this.started = true;
      this.intersectionObserver.observe(this.element);
    }
  }
  stop() {
    if (this.started) {
      this.started = false;
      this.intersectionObserver.unobserve(this.element);
    }
  }
  intersect = (entries) => {
    const lastEntry = entries.slice(-1)[0];
    if (lastEntry?.isIntersecting) {
      this.delegate.elementAppearedInViewport(this.element);
    }
  };
};
var StreamMessage = class {
  static contentType = "text/vnd.turbo-stream.html";
  static wrap(message) {
    if (typeof message == "string") {
      return new this(createDocumentFragment(message));
    } else {
      return message;
    }
  }
  constructor(fragment) {
    this.fragment = importStreamElements(fragment);
  }
};
function importStreamElements(fragment) {
  for (const element of fragment.querySelectorAll("turbo-stream")) {
    const streamElement = document.importNode(element, true);
    for (const inertScriptElement of streamElement.templateElement.content.querySelectorAll("script")) {
      inertScriptElement.replaceWith(activateScriptElement(inertScriptElement));
    }
    element.replaceWith(streamElement);
  }
  return fragment;
}
var PREFETCH_DELAY = 100;
var PrefetchCache = class {
  #prefetchTimeout = null;
  #prefetched = null;
  get(url) {
    if (this.#prefetched && this.#prefetched.url === url && this.#prefetched.expire > Date.now()) {
      return this.#prefetched.request;
    }
  }
  setLater(url, request, ttl) {
    this.clear();
    this.#prefetchTimeout = setTimeout(() => {
      request.perform();
      this.set(url, request, ttl);
      this.#prefetchTimeout = null;
    }, PREFETCH_DELAY);
  }
  set(url, request, ttl) {
    this.#prefetched = { url, request, expire: new Date((/* @__PURE__ */ new Date()).getTime() + ttl) };
  }
  clear() {
    if (this.#prefetchTimeout) clearTimeout(this.#prefetchTimeout);
    this.#prefetched = null;
  }
};
var cacheTtl = 10 * 1e3;
var prefetchCache = new PrefetchCache();
var FormSubmissionState = {
  initialized: "initialized",
  requesting: "requesting",
  waiting: "waiting",
  receiving: "receiving",
  stopping: "stopping",
  stopped: "stopped"
};
var FormSubmission = class _FormSubmission {
  state = FormSubmissionState.initialized;
  static confirmMethod(message) {
    return Promise.resolve(confirm(message));
  }
  constructor(delegate, formElement, submitter2, mustRedirect = false) {
    const method = getMethod(formElement, submitter2);
    const action = getAction(getFormAction(formElement, submitter2), method);
    const body = buildFormData(formElement, submitter2);
    const enctype = getEnctype(formElement, submitter2);
    this.delegate = delegate;
    this.formElement = formElement;
    this.submitter = submitter2;
    this.fetchRequest = new FetchRequest(this, method, action, body, formElement, enctype);
    this.mustRedirect = mustRedirect;
  }
  get method() {
    return this.fetchRequest.method;
  }
  set method(value) {
    this.fetchRequest.method = value;
  }
  get action() {
    return this.fetchRequest.url.toString();
  }
  set action(value) {
    this.fetchRequest.url = expandURL(value);
  }
  get body() {
    return this.fetchRequest.body;
  }
  get enctype() {
    return this.fetchRequest.enctype;
  }
  get isSafe() {
    return this.fetchRequest.isSafe;
  }
  get location() {
    return this.fetchRequest.url;
  }
  // The submission process
  async start() {
    const { initialized, requesting } = FormSubmissionState;
    const confirmationMessage = getAttribute("data-turbo-confirm", this.submitter, this.formElement);
    if (typeof confirmationMessage === "string") {
      const confirmMethod = typeof config.forms.confirm === "function" ? config.forms.confirm : _FormSubmission.confirmMethod;
      const answer = await confirmMethod(confirmationMessage, this.formElement, this.submitter);
      if (!answer) {
        return;
      }
    }
    if (this.state == initialized) {
      this.state = requesting;
      return this.fetchRequest.perform();
    }
  }
  stop() {
    const { stopping, stopped } = FormSubmissionState;
    if (this.state != stopping && this.state != stopped) {
      this.state = stopping;
      this.fetchRequest.cancel();
      return true;
    }
  }
  // Fetch request delegate
  prepareRequest(request) {
    if (!request.isSafe) {
      const token = getCookieValue(getMetaContent("csrf-param")) || getMetaContent("csrf-token");
      if (token) {
        request.headers["X-CSRF-Token"] = token;
      }
    }
    if (this.requestAcceptsTurboStreamResponse(request)) {
      request.acceptResponseType(StreamMessage.contentType);
    }
  }
  requestStarted(_request) {
    this.state = FormSubmissionState.waiting;
    if (this.submitter) config.forms.submitter.beforeSubmit(this.submitter);
    this.setSubmitsWith();
    markAsBusy(this.formElement);
    dispatch("turbo:submit-start", {
      target: this.formElement,
      detail: { formSubmission: this }
    });
    this.delegate.formSubmissionStarted(this);
  }
  requestPreventedHandlingResponse(request, response) {
    prefetchCache.clear();
    this.result = { success: response.succeeded, fetchResponse: response };
  }
  requestSucceededWithResponse(request, response) {
    if (response.clientError || response.serverError) {
      this.delegate.formSubmissionFailedWithResponse(this, response);
      return;
    }
    prefetchCache.clear();
    if (this.requestMustRedirect(request) && responseSucceededWithoutRedirect(response)) {
      const error2 = new Error("Form responses must redirect to another location");
      this.delegate.formSubmissionErrored(this, error2);
    } else {
      this.state = FormSubmissionState.receiving;
      this.result = { success: true, fetchResponse: response };
      this.delegate.formSubmissionSucceededWithResponse(this, response);
    }
  }
  requestFailedWithResponse(request, response) {
    this.result = { success: false, fetchResponse: response };
    this.delegate.formSubmissionFailedWithResponse(this, response);
  }
  requestErrored(request, error2) {
    this.result = { success: false, error: error2 };
    this.delegate.formSubmissionErrored(this, error2);
  }
  requestFinished(_request) {
    this.state = FormSubmissionState.stopped;
    if (this.submitter) config.forms.submitter.afterSubmit(this.submitter);
    this.resetSubmitterText();
    clearBusyState(this.formElement);
    dispatch("turbo:submit-end", {
      target: this.formElement,
      detail: { formSubmission: this, ...this.result }
    });
    this.delegate.formSubmissionFinished(this);
  }
  // Private
  setSubmitsWith() {
    if (!this.submitter || !this.submitsWith) return;
    if (this.submitter.matches("button")) {
      this.originalSubmitText = this.submitter.innerHTML;
      this.submitter.innerHTML = this.submitsWith;
    } else if (this.submitter.matches("input")) {
      const input = this.submitter;
      this.originalSubmitText = input.value;
      input.value = this.submitsWith;
    }
  }
  resetSubmitterText() {
    if (!this.submitter || !this.originalSubmitText) return;
    if (this.submitter.matches("button")) {
      this.submitter.innerHTML = this.originalSubmitText;
    } else if (this.submitter.matches("input")) {
      const input = this.submitter;
      input.value = this.originalSubmitText;
    }
  }
  requestMustRedirect(request) {
    return !request.isSafe && this.mustRedirect;
  }
  requestAcceptsTurboStreamResponse(request) {
    return !request.isSafe || hasAttribute("data-turbo-stream", this.submitter, this.formElement);
  }
  get submitsWith() {
    return this.submitter?.getAttribute("data-turbo-submits-with");
  }
};
function buildFormData(formElement, submitter2) {
  const formData = new FormData(formElement);
  const name = submitter2?.getAttribute("name");
  const value = submitter2?.getAttribute("value");
  if (name) {
    formData.append(name, value || "");
  }
  return formData;
}
function getCookieValue(cookieName) {
  if (cookieName != null) {
    const cookies = document.cookie ? document.cookie.split("; ") : [];
    const cookie = cookies.find((cookie2) => cookie2.startsWith(cookieName));
    if (cookie) {
      const value = cookie.split("=").slice(1).join("=");
      return value ? decodeURIComponent(value) : void 0;
    }
  }
}
function responseSucceededWithoutRedirect(response) {
  return response.statusCode == 200 && !response.redirected;
}
function getFormAction(formElement, submitter2) {
  const formElementAction = typeof formElement.action === "string" ? formElement.action : null;
  if (submitter2?.hasAttribute("formaction")) {
    return submitter2.getAttribute("formaction") || "";
  } else {
    return formElement.getAttribute("action") || formElementAction || "";
  }
}
function getAction(formAction, fetchMethod) {
  const action = expandURL(formAction);
  if (isSafe(fetchMethod)) {
    action.search = "";
  }
  return action;
}
function getMethod(formElement, submitter2) {
  const method = submitter2?.getAttribute("formmethod") || formElement.getAttribute("method") || "";
  return fetchMethodFromString(method.toLowerCase()) || FetchMethod.get;
}
function getEnctype(formElement, submitter2) {
  return fetchEnctypeFromString(submitter2?.getAttribute("formenctype") || formElement.enctype);
}
var Snapshot = class {
  constructor(element) {
    this.element = element;
  }
  get activeElement() {
    return this.element.ownerDocument.activeElement;
  }
  get children() {
    return [...this.element.children];
  }
  hasAnchor(anchor) {
    return this.getElementForAnchor(anchor) != null;
  }
  getElementForAnchor(anchor) {
    return anchor ? this.element.querySelector(`[id='${anchor}'], a[name='${anchor}']`) : null;
  }
  get isConnected() {
    return this.element.isConnected;
  }
  get firstAutofocusableElement() {
    return queryAutofocusableElement(this.element);
  }
  get permanentElements() {
    return queryPermanentElementsAll(this.element);
  }
  getPermanentElementById(id2) {
    return getPermanentElementById(this.element, id2);
  }
  getPermanentElementMapForSnapshot(snapshot) {
    const permanentElementMap = {};
    for (const currentPermanentElement of this.permanentElements) {
      const { id: id2 } = currentPermanentElement;
      const newPermanentElement = snapshot.getPermanentElementById(id2);
      if (newPermanentElement) {
        permanentElementMap[id2] = [currentPermanentElement, newPermanentElement];
      }
    }
    return permanentElementMap;
  }
};
function getPermanentElementById(node, id2) {
  return node.querySelector(`#${id2}[data-turbo-permanent]`);
}
function queryPermanentElementsAll(node) {
  return node.querySelectorAll("[id][data-turbo-permanent]");
}
var FormSubmitObserver = class {
  started = false;
  constructor(delegate, eventTarget) {
    this.delegate = delegate;
    this.eventTarget = eventTarget;
  }
  start() {
    if (!this.started) {
      this.eventTarget.addEventListener("submit", this.submitCaptured, true);
      this.started = true;
    }
  }
  stop() {
    if (this.started) {
      this.eventTarget.removeEventListener("submit", this.submitCaptured, true);
      this.started = false;
    }
  }
  submitCaptured = () => {
    this.eventTarget.removeEventListener("submit", this.submitBubbled, false);
    this.eventTarget.addEventListener("submit", this.submitBubbled, false);
  };
  submitBubbled = (event) => {
    if (!event.defaultPrevented) {
      const form = event.target instanceof HTMLFormElement ? event.target : void 0;
      const submitter2 = event.submitter || void 0;
      if (form && submissionDoesNotDismissDialog(form, submitter2) && submissionDoesNotTargetIFrame(form, submitter2) && this.delegate.willSubmitForm(form, submitter2)) {
        event.preventDefault();
        event.stopImmediatePropagation();
        this.delegate.formSubmitted(form, submitter2);
      }
    }
  };
};
function submissionDoesNotDismissDialog(form, submitter2) {
  const method = submitter2?.getAttribute("formmethod") || form.getAttribute("method");
  return method != "dialog";
}
function submissionDoesNotTargetIFrame(form, submitter2) {
  const target = submitter2?.getAttribute("formtarget") || form.getAttribute("target");
  return doesNotTargetIFrame(target);
}
var View = class {
  #resolveRenderPromise = (_value) => {
  };
  #resolveInterceptionPromise = (_value) => {
  };
  constructor(delegate, element) {
    this.delegate = delegate;
    this.element = element;
  }
  // Scrolling
  scrollToAnchor(anchor) {
    const element = this.snapshot.getElementForAnchor(anchor);
    if (element) {
      this.scrollToElement(element);
      this.focusElement(element);
    } else {
      this.scrollToPosition({ x: 0, y: 0 });
    }
  }
  scrollToAnchorFromLocation(location2) {
    this.scrollToAnchor(getAnchor(location2));
  }
  scrollToElement(element) {
    element.scrollIntoView();
  }
  focusElement(element) {
    if (element instanceof HTMLElement) {
      if (element.hasAttribute("tabindex")) {
        element.focus();
      } else {
        element.setAttribute("tabindex", "-1");
        element.focus();
        element.removeAttribute("tabindex");
      }
    }
  }
  scrollToPosition({ x: x2, y: y2 }) {
    this.scrollRoot.scrollTo(x2, y2);
  }
  scrollToTop() {
    this.scrollToPosition({ x: 0, y: 0 });
  }
  get scrollRoot() {
    return window;
  }
  // Rendering
  async render(renderer) {
    const { isPreview, shouldRender, willRender, newSnapshot: snapshot } = renderer;
    const shouldInvalidate = willRender;
    if (shouldRender) {
      try {
        this.renderPromise = new Promise((resolve) => this.#resolveRenderPromise = resolve);
        this.renderer = renderer;
        await this.prepareToRenderSnapshot(renderer);
        const renderInterception = new Promise((resolve) => this.#resolveInterceptionPromise = resolve);
        const options = { resume: this.#resolveInterceptionPromise, render: this.renderer.renderElement, renderMethod: this.renderer.renderMethod };
        const immediateRender = this.delegate.allowsImmediateRender(snapshot, options);
        if (!immediateRender) await renderInterception;
        await this.renderSnapshot(renderer);
        this.delegate.viewRenderedSnapshot(snapshot, isPreview, this.renderer.renderMethod);
        this.delegate.preloadOnLoadLinksForView(this.element);
        this.finishRenderingSnapshot(renderer);
      } finally {
        delete this.renderer;
        this.#resolveRenderPromise(void 0);
        delete this.renderPromise;
      }
    } else if (shouldInvalidate) {
      this.invalidate(renderer.reloadReason);
    }
  }
  invalidate(reason) {
    this.delegate.viewInvalidated(reason);
  }
  async prepareToRenderSnapshot(renderer) {
    this.markAsPreview(renderer.isPreview);
    await renderer.prepareToRender();
  }
  markAsPreview(isPreview) {
    if (isPreview) {
      this.element.setAttribute("data-turbo-preview", "");
    } else {
      this.element.removeAttribute("data-turbo-preview");
    }
  }
  markVisitDirection(direction) {
    this.element.setAttribute("data-turbo-visit-direction", direction);
  }
  unmarkVisitDirection() {
    this.element.removeAttribute("data-turbo-visit-direction");
  }
  async renderSnapshot(renderer) {
    await renderer.render();
  }
  finishRenderingSnapshot(renderer) {
    renderer.finishRendering();
  }
};
var FrameView = class extends View {
  missing() {
    this.element.innerHTML = `<strong class="turbo-frame-error">Content missing</strong>`;
  }
  get snapshot() {
    return new Snapshot(this.element);
  }
};
var LinkInterceptor = class {
  constructor(delegate, element) {
    this.delegate = delegate;
    this.element = element;
  }
  start() {
    this.element.addEventListener("click", this.clickBubbled);
    document.addEventListener("turbo:click", this.linkClicked);
    document.addEventListener("turbo:before-visit", this.willVisit);
  }
  stop() {
    this.element.removeEventListener("click", this.clickBubbled);
    document.removeEventListener("turbo:click", this.linkClicked);
    document.removeEventListener("turbo:before-visit", this.willVisit);
  }
  clickBubbled = (event) => {
    if (this.clickEventIsSignificant(event)) {
      this.clickEvent = event;
    } else {
      delete this.clickEvent;
    }
  };
  linkClicked = (event) => {
    if (this.clickEvent && this.clickEventIsSignificant(event)) {
      if (this.delegate.shouldInterceptLinkClick(event.target, event.detail.url, event.detail.originalEvent)) {
        this.clickEvent.preventDefault();
        event.preventDefault();
        this.delegate.linkClickIntercepted(event.target, event.detail.url, event.detail.originalEvent);
      }
    }
    delete this.clickEvent;
  };
  willVisit = (_event) => {
    delete this.clickEvent;
  };
  clickEventIsSignificant(event) {
    const target = event.composed ? event.target?.parentElement : event.target;
    const element = findLinkFromClickTarget(target) || target;
    return element instanceof Element && element.closest("turbo-frame, html") == this.element;
  }
};
var LinkClickObserver = class {
  started = false;
  constructor(delegate, eventTarget) {
    this.delegate = delegate;
    this.eventTarget = eventTarget;
  }
  start() {
    if (!this.started) {
      this.eventTarget.addEventListener("click", this.clickCaptured, true);
      this.started = true;
    }
  }
  stop() {
    if (this.started) {
      this.eventTarget.removeEventListener("click", this.clickCaptured, true);
      this.started = false;
    }
  }
  clickCaptured = () => {
    this.eventTarget.removeEventListener("click", this.clickBubbled, false);
    this.eventTarget.addEventListener("click", this.clickBubbled, false);
  };
  clickBubbled = (event) => {
    if (event instanceof MouseEvent && this.clickEventIsSignificant(event)) {
      const target = event.composedPath && event.composedPath()[0] || event.target;
      const link = findLinkFromClickTarget(target);
      if (link && doesNotTargetIFrame(link.target)) {
        const location2 = getLocationForLink(link);
        if (this.delegate.willFollowLinkToLocation(link, location2, event)) {
          event.preventDefault();
          this.delegate.followedLinkToLocation(link, location2);
        }
      }
    }
  };
  clickEventIsSignificant(event) {
    return !(event.target && event.target.isContentEditable || event.defaultPrevented || event.which > 1 || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey);
  }
};
var FormLinkClickObserver = class {
  constructor(delegate, element) {
    this.delegate = delegate;
    this.linkInterceptor = new LinkClickObserver(this, element);
  }
  start() {
    this.linkInterceptor.start();
  }
  stop() {
    this.linkInterceptor.stop();
  }
  // Link hover observer delegate
  canPrefetchRequestToLocation(link, location2) {
    return false;
  }
  prefetchAndCacheRequestToLocation(link, location2) {
    return;
  }
  // Link click observer delegate
  willFollowLinkToLocation(link, location2, originalEvent) {
    return this.delegate.willSubmitFormLinkToLocation(link, location2, originalEvent) && (link.hasAttribute("data-turbo-method") || link.hasAttribute("data-turbo-stream"));
  }
  followedLinkToLocation(link, location2) {
    const form = document.createElement("form");
    const type = "hidden";
    for (const [name, value] of location2.searchParams) {
      form.append(Object.assign(document.createElement("input"), { type, name, value }));
    }
    const action = Object.assign(location2, { search: "" });
    form.setAttribute("data-turbo", "true");
    form.setAttribute("action", action.href);
    form.setAttribute("hidden", "");
    const method = link.getAttribute("data-turbo-method");
    if (method) form.setAttribute("method", method);
    const turboFrame = link.getAttribute("data-turbo-frame");
    if (turboFrame) form.setAttribute("data-turbo-frame", turboFrame);
    const turboAction = getVisitAction(link);
    if (turboAction) form.setAttribute("data-turbo-action", turboAction);
    const turboConfirm = link.getAttribute("data-turbo-confirm");
    if (turboConfirm) form.setAttribute("data-turbo-confirm", turboConfirm);
    const turboStream = link.hasAttribute("data-turbo-stream");
    if (turboStream) form.setAttribute("data-turbo-stream", "");
    this.delegate.submittedFormLinkToLocation(link, location2, form);
    document.body.appendChild(form);
    form.addEventListener("turbo:submit-end", () => form.remove(), { once: true });
    requestAnimationFrame(() => form.requestSubmit());
  }
};
var Bardo = class {
  static async preservingPermanentElements(delegate, permanentElementMap, callback) {
    const bardo = new this(delegate, permanentElementMap);
    bardo.enter();
    await callback();
    bardo.leave();
  }
  constructor(delegate, permanentElementMap) {
    this.delegate = delegate;
    this.permanentElementMap = permanentElementMap;
  }
  enter() {
    for (const id2 in this.permanentElementMap) {
      const [currentPermanentElement, newPermanentElement] = this.permanentElementMap[id2];
      this.delegate.enteringBardo(currentPermanentElement, newPermanentElement);
      this.replaceNewPermanentElementWithPlaceholder(newPermanentElement);
    }
  }
  leave() {
    for (const id2 in this.permanentElementMap) {
      const [currentPermanentElement] = this.permanentElementMap[id2];
      this.replaceCurrentPermanentElementWithClone(currentPermanentElement);
      this.replacePlaceholderWithPermanentElement(currentPermanentElement);
      this.delegate.leavingBardo(currentPermanentElement);
    }
  }
  replaceNewPermanentElementWithPlaceholder(permanentElement) {
    const placeholder = createPlaceholderForPermanentElement(permanentElement);
    permanentElement.replaceWith(placeholder);
  }
  replaceCurrentPermanentElementWithClone(permanentElement) {
    const clone = permanentElement.cloneNode(true);
    permanentElement.replaceWith(clone);
  }
  replacePlaceholderWithPermanentElement(permanentElement) {
    const placeholder = this.getPlaceholderById(permanentElement.id);
    placeholder?.replaceWith(permanentElement);
  }
  getPlaceholderById(id2) {
    return this.placeholders.find((element) => element.content == id2);
  }
  get placeholders() {
    return [...document.querySelectorAll("meta[name=turbo-permanent-placeholder][content]")];
  }
};
function createPlaceholderForPermanentElement(permanentElement) {
  const element = document.createElement("meta");
  element.setAttribute("name", "turbo-permanent-placeholder");
  element.setAttribute("content", permanentElement.id);
  return element;
}
var Renderer = class {
  #activeElement = null;
  static renderElement(currentElement, newElement) {
  }
  constructor(currentSnapshot, newSnapshot, isPreview, willRender = true) {
    this.currentSnapshot = currentSnapshot;
    this.newSnapshot = newSnapshot;
    this.isPreview = isPreview;
    this.willRender = willRender;
    this.renderElement = this.constructor.renderElement;
    this.promise = new Promise((resolve, reject) => this.resolvingFunctions = { resolve, reject });
  }
  get shouldRender() {
    return true;
  }
  get shouldAutofocus() {
    return true;
  }
  get reloadReason() {
    return;
  }
  prepareToRender() {
    return;
  }
  render() {
  }
  finishRendering() {
    if (this.resolvingFunctions) {
      this.resolvingFunctions.resolve();
      delete this.resolvingFunctions;
    }
  }
  async preservingPermanentElements(callback) {
    await Bardo.preservingPermanentElements(this, this.permanentElementMap, callback);
  }
  focusFirstAutofocusableElement() {
    if (this.shouldAutofocus) {
      const element = this.connectedSnapshot.firstAutofocusableElement;
      if (element) {
        element.focus();
      }
    }
  }
  // Bardo delegate
  enteringBardo(currentPermanentElement) {
    if (this.#activeElement) return;
    if (currentPermanentElement.contains(this.currentSnapshot.activeElement)) {
      this.#activeElement = this.currentSnapshot.activeElement;
    }
  }
  leavingBardo(currentPermanentElement) {
    if (currentPermanentElement.contains(this.#activeElement) && this.#activeElement instanceof HTMLElement) {
      this.#activeElement.focus();
      this.#activeElement = null;
    }
  }
  get connectedSnapshot() {
    return this.newSnapshot.isConnected ? this.newSnapshot : this.currentSnapshot;
  }
  get currentElement() {
    return this.currentSnapshot.element;
  }
  get newElement() {
    return this.newSnapshot.element;
  }
  get permanentElementMap() {
    return this.currentSnapshot.getPermanentElementMapForSnapshot(this.newSnapshot);
  }
  get renderMethod() {
    return "replace";
  }
};
var FrameRenderer = class extends Renderer {
  static renderElement(currentElement, newElement) {
    const destinationRange = document.createRange();
    destinationRange.selectNodeContents(currentElement);
    destinationRange.deleteContents();
    const frameElement = newElement;
    const sourceRange = frameElement.ownerDocument?.createRange();
    if (sourceRange) {
      sourceRange.selectNodeContents(frameElement);
      currentElement.appendChild(sourceRange.extractContents());
    }
  }
  constructor(delegate, currentSnapshot, newSnapshot, renderElement, isPreview, willRender = true) {
    super(currentSnapshot, newSnapshot, renderElement, isPreview, willRender);
    this.delegate = delegate;
  }
  get shouldRender() {
    return true;
  }
  async render() {
    await nextRepaint();
    this.preservingPermanentElements(() => {
      this.loadFrameElement();
    });
    this.scrollFrameIntoView();
    await nextRepaint();
    this.focusFirstAutofocusableElement();
    await nextRepaint();
    this.activateScriptElements();
  }
  loadFrameElement() {
    this.delegate.willRenderFrame(this.currentElement, this.newElement);
    this.renderElement(this.currentElement, this.newElement);
  }
  scrollFrameIntoView() {
    if (this.currentElement.autoscroll || this.newElement.autoscroll) {
      const element = this.currentElement.firstElementChild;
      const block = readScrollLogicalPosition(this.currentElement.getAttribute("data-autoscroll-block"), "end");
      const behavior = readScrollBehavior(this.currentElement.getAttribute("data-autoscroll-behavior"), "auto");
      if (element) {
        element.scrollIntoView({ block, behavior });
        return true;
      }
    }
    return false;
  }
  activateScriptElements() {
    for (const inertScriptElement of this.newScriptElements) {
      const activatedScriptElement = activateScriptElement(inertScriptElement);
      inertScriptElement.replaceWith(activatedScriptElement);
    }
  }
  get newScriptElements() {
    return this.currentElement.querySelectorAll("script");
  }
};
function readScrollLogicalPosition(value, defaultValue) {
  if (value == "end" || value == "start" || value == "center" || value == "nearest") {
    return value;
  } else {
    return defaultValue;
  }
}
function readScrollBehavior(value, defaultValue) {
  if (value == "auto" || value == "smooth") {
    return value;
  } else {
    return defaultValue;
  }
}
var Idiomorph = function() {
  const noOp = () => {
  };
  const defaults = {
    morphStyle: "outerHTML",
    callbacks: {
      beforeNodeAdded: noOp,
      afterNodeAdded: noOp,
      beforeNodeMorphed: noOp,
      afterNodeMorphed: noOp,
      beforeNodeRemoved: noOp,
      afterNodeRemoved: noOp,
      beforeAttributeUpdated: noOp
    },
    head: {
      style: "merge",
      shouldPreserve: (elt) => elt.getAttribute("im-preserve") === "true",
      shouldReAppend: (elt) => elt.getAttribute("im-re-append") === "true",
      shouldRemove: noOp,
      afterHeadMorphed: noOp
    },
    restoreFocus: true
  };
  function morph(oldNode, newContent, config2 = {}) {
    oldNode = normalizeElement(oldNode);
    const newNode = normalizeParent(newContent);
    const ctx = createMorphContext(oldNode, newNode, config2);
    const morphedNodes = saveAndRestoreFocus(ctx, () => {
      return withHeadBlocking(
        ctx,
        oldNode,
        newNode,
        /** @param {MorphContext} ctx */
        (ctx2) => {
          if (ctx2.morphStyle === "innerHTML") {
            morphChildren2(ctx2, oldNode, newNode);
            return Array.from(oldNode.childNodes);
          } else {
            return morphOuterHTML(ctx2, oldNode, newNode);
          }
        }
      );
    });
    ctx.pantry.remove();
    return morphedNodes;
  }
  function morphOuterHTML(ctx, oldNode, newNode) {
    const oldParent = normalizeParent(oldNode);
    let childNodes = Array.from(oldParent.childNodes);
    const index = childNodes.indexOf(oldNode);
    const rightMargin = childNodes.length - (index + 1);
    morphChildren2(
      ctx,
      oldParent,
      newNode,
      // these two optional params are the secret sauce
      oldNode,
      // start point for iteration
      oldNode.nextSibling
      // end point for iteration
    );
    childNodes = Array.from(oldParent.childNodes);
    return childNodes.slice(index, childNodes.length - rightMargin);
  }
  function saveAndRestoreFocus(ctx, fn3) {
    if (!ctx.config.restoreFocus) return fn3();
    let activeElement = (
      /** @type {HTMLInputElement|HTMLTextAreaElement|null} */
      document.activeElement
    );
    if (!(activeElement instanceof HTMLInputElement || activeElement instanceof HTMLTextAreaElement)) {
      return fn3();
    }
    const { id: activeElementId, selectionStart, selectionEnd } = activeElement;
    const results = fn3();
    if (activeElementId && activeElementId !== document.activeElement?.id) {
      activeElement = ctx.target.querySelector(`#${activeElementId}`);
      activeElement?.focus();
    }
    if (activeElement && !activeElement.selectionEnd && selectionEnd) {
      activeElement.setSelectionRange(selectionStart, selectionEnd);
    }
    return results;
  }
  const morphChildren2 = /* @__PURE__ */ function() {
    function morphChildren3(ctx, oldParent, newParent, insertionPoint = null, endPoint = null) {
      if (oldParent instanceof HTMLTemplateElement && newParent instanceof HTMLTemplateElement) {
        oldParent = oldParent.content;
        newParent = newParent.content;
      }
      insertionPoint ||= oldParent.firstChild;
      for (const newChild of newParent.childNodes) {
        if (insertionPoint && insertionPoint != endPoint) {
          const bestMatch = findBestMatch(
            ctx,
            newChild,
            insertionPoint,
            endPoint
          );
          if (bestMatch) {
            if (bestMatch !== insertionPoint) {
              removeNodesBetween(ctx, insertionPoint, bestMatch);
            }
            morphNode(bestMatch, newChild, ctx);
            insertionPoint = bestMatch.nextSibling;
            continue;
          }
        }
        if (newChild instanceof Element && ctx.persistentIds.has(newChild.id)) {
          const movedChild = moveBeforeById(
            oldParent,
            newChild.id,
            insertionPoint,
            ctx
          );
          morphNode(movedChild, newChild, ctx);
          insertionPoint = movedChild.nextSibling;
          continue;
        }
        const insertedNode = createNode(
          oldParent,
          newChild,
          insertionPoint,
          ctx
        );
        if (insertedNode) {
          insertionPoint = insertedNode.nextSibling;
        }
      }
      while (insertionPoint && insertionPoint != endPoint) {
        const tempNode = insertionPoint;
        insertionPoint = insertionPoint.nextSibling;
        removeNode(ctx, tempNode);
      }
    }
    function createNode(oldParent, newChild, insertionPoint, ctx) {
      if (ctx.callbacks.beforeNodeAdded(newChild) === false) return null;
      if (ctx.idMap.has(newChild)) {
        const newEmptyChild = document.createElement(
          /** @type {Element} */
          newChild.tagName
        );
        oldParent.insertBefore(newEmptyChild, insertionPoint);
        morphNode(newEmptyChild, newChild, ctx);
        ctx.callbacks.afterNodeAdded(newEmptyChild);
        return newEmptyChild;
      } else {
        const newClonedChild = document.importNode(newChild, true);
        oldParent.insertBefore(newClonedChild, insertionPoint);
        ctx.callbacks.afterNodeAdded(newClonedChild);
        return newClonedChild;
      }
    }
    const findBestMatch = /* @__PURE__ */ function() {
      function findBestMatch2(ctx, node, startPoint, endPoint) {
        let softMatch = null;
        let nextSibling = node.nextSibling;
        let siblingSoftMatchCount = 0;
        let cursor = startPoint;
        while (cursor && cursor != endPoint) {
          if (isSoftMatch(cursor, node)) {
            if (isIdSetMatch(ctx, cursor, node)) {
              return cursor;
            }
            if (softMatch === null) {
              if (!ctx.idMap.has(cursor)) {
                softMatch = cursor;
              }
            }
          }
          if (softMatch === null && nextSibling && isSoftMatch(cursor, nextSibling)) {
            siblingSoftMatchCount++;
            nextSibling = nextSibling.nextSibling;
            if (siblingSoftMatchCount >= 2) {
              softMatch = void 0;
            }
          }
          if (cursor.contains(document.activeElement)) break;
          cursor = cursor.nextSibling;
        }
        return softMatch || null;
      }
      function isIdSetMatch(ctx, oldNode, newNode) {
        let oldSet = ctx.idMap.get(oldNode);
        let newSet = ctx.idMap.get(newNode);
        if (!newSet || !oldSet) return false;
        for (const id2 of oldSet) {
          if (newSet.has(id2)) {
            return true;
          }
        }
        return false;
      }
      function isSoftMatch(oldNode, newNode) {
        const oldElt = (
          /** @type {Element} */
          oldNode
        );
        const newElt = (
          /** @type {Element} */
          newNode
        );
        return oldElt.nodeType === newElt.nodeType && oldElt.tagName === newElt.tagName && // If oldElt has an `id` with possible state and it doesn't match newElt.id then avoid morphing.
        // We'll still match an anonymous node with an IDed newElt, though, because if it got this far,
        // its not persistent, and new nodes can't have any hidden state.
        (!oldElt.id || oldElt.id === newElt.id);
      }
      return findBestMatch2;
    }();
    function removeNode(ctx, node) {
      if (ctx.idMap.has(node)) {
        moveBefore(ctx.pantry, node, null);
      } else {
        if (ctx.callbacks.beforeNodeRemoved(node) === false) return;
        node.parentNode?.removeChild(node);
        ctx.callbacks.afterNodeRemoved(node);
      }
    }
    function removeNodesBetween(ctx, startInclusive, endExclusive) {
      let cursor = startInclusive;
      while (cursor && cursor !== endExclusive) {
        let tempNode = (
          /** @type {Node} */
          cursor
        );
        cursor = cursor.nextSibling;
        removeNode(ctx, tempNode);
      }
      return cursor;
    }
    function moveBeforeById(parentNode, id2, after, ctx) {
      const target = (
        /** @type {Element} - will always be found */
        ctx.target.querySelector(`#${id2}`) || ctx.pantry.querySelector(`#${id2}`)
      );
      removeElementFromAncestorsIdMaps(target, ctx);
      moveBefore(parentNode, target, after);
      return target;
    }
    function removeElementFromAncestorsIdMaps(element, ctx) {
      const id2 = element.id;
      while (element = element.parentNode) {
        let idSet = ctx.idMap.get(element);
        if (idSet) {
          idSet.delete(id2);
          if (!idSet.size) {
            ctx.idMap.delete(element);
          }
        }
      }
    }
    function moveBefore(parentNode, element, after) {
      if (parentNode.moveBefore) {
        try {
          parentNode.moveBefore(element, after);
        } catch (e2) {
          parentNode.insertBefore(element, after);
        }
      } else {
        parentNode.insertBefore(element, after);
      }
    }
    return morphChildren3;
  }();
  const morphNode = /* @__PURE__ */ function() {
    function morphNode2(oldNode, newContent, ctx) {
      if (ctx.ignoreActive && oldNode === document.activeElement) {
        return null;
      }
      if (ctx.callbacks.beforeNodeMorphed(oldNode, newContent) === false) {
        return oldNode;
      }
      if (oldNode instanceof HTMLHeadElement && ctx.head.ignore) ;
      else if (oldNode instanceof HTMLHeadElement && ctx.head.style !== "morph") {
        handleHeadElement(
          oldNode,
          /** @type {HTMLHeadElement} */
          newContent,
          ctx
        );
      } else {
        morphAttributes(oldNode, newContent, ctx);
        if (!ignoreValueOfActiveElement(oldNode, ctx)) {
          morphChildren2(ctx, oldNode, newContent);
        }
      }
      ctx.callbacks.afterNodeMorphed(oldNode, newContent);
      return oldNode;
    }
    function morphAttributes(oldNode, newNode, ctx) {
      let type = newNode.nodeType;
      if (type === 1) {
        const oldElt = (
          /** @type {Element} */
          oldNode
        );
        const newElt = (
          /** @type {Element} */
          newNode
        );
        const oldAttributes = oldElt.attributes;
        const newAttributes = newElt.attributes;
        for (const newAttribute of newAttributes) {
          if (ignoreAttribute(newAttribute.name, oldElt, "update", ctx)) {
            continue;
          }
          if (oldElt.getAttribute(newAttribute.name) !== newAttribute.value) {
            oldElt.setAttribute(newAttribute.name, newAttribute.value);
          }
        }
        for (let i2 = oldAttributes.length - 1; 0 <= i2; i2--) {
          const oldAttribute = oldAttributes[i2];
          if (!oldAttribute) continue;
          if (!newElt.hasAttribute(oldAttribute.name)) {
            if (ignoreAttribute(oldAttribute.name, oldElt, "remove", ctx)) {
              continue;
            }
            oldElt.removeAttribute(oldAttribute.name);
          }
        }
        if (!ignoreValueOfActiveElement(oldElt, ctx)) {
          syncInputValue(oldElt, newElt, ctx);
        }
      }
      if (type === 8 || type === 3) {
        if (oldNode.nodeValue !== newNode.nodeValue) {
          oldNode.nodeValue = newNode.nodeValue;
        }
      }
    }
    function syncInputValue(oldElement, newElement, ctx) {
      if (oldElement instanceof HTMLInputElement && newElement instanceof HTMLInputElement && newElement.type !== "file") {
        let newValue = newElement.value;
        let oldValue = oldElement.value;
        syncBooleanAttribute(oldElement, newElement, "checked", ctx);
        syncBooleanAttribute(oldElement, newElement, "disabled", ctx);
        if (!newElement.hasAttribute("value")) {
          if (!ignoreAttribute("value", oldElement, "remove", ctx)) {
            oldElement.value = "";
            oldElement.removeAttribute("value");
          }
        } else if (oldValue !== newValue) {
          if (!ignoreAttribute("value", oldElement, "update", ctx)) {
            oldElement.setAttribute("value", newValue);
            oldElement.value = newValue;
          }
        }
      } else if (oldElement instanceof HTMLOptionElement && newElement instanceof HTMLOptionElement) {
        syncBooleanAttribute(oldElement, newElement, "selected", ctx);
      } else if (oldElement instanceof HTMLTextAreaElement && newElement instanceof HTMLTextAreaElement) {
        let newValue = newElement.value;
        let oldValue = oldElement.value;
        if (ignoreAttribute("value", oldElement, "update", ctx)) {
          return;
        }
        if (newValue !== oldValue) {
          oldElement.value = newValue;
        }
        if (oldElement.firstChild && oldElement.firstChild.nodeValue !== newValue) {
          oldElement.firstChild.nodeValue = newValue;
        }
      }
    }
    function syncBooleanAttribute(oldElement, newElement, attributeName, ctx) {
      const newLiveValue = newElement[attributeName], oldLiveValue = oldElement[attributeName];
      if (newLiveValue !== oldLiveValue) {
        const ignoreUpdate = ignoreAttribute(
          attributeName,
          oldElement,
          "update",
          ctx
        );
        if (!ignoreUpdate) {
          oldElement[attributeName] = newElement[attributeName];
        }
        if (newLiveValue) {
          if (!ignoreUpdate) {
            oldElement.setAttribute(attributeName, "");
          }
        } else {
          if (!ignoreAttribute(attributeName, oldElement, "remove", ctx)) {
            oldElement.removeAttribute(attributeName);
          }
        }
      }
    }
    function ignoreAttribute(attr, element, updateType, ctx) {
      if (attr === "value" && ctx.ignoreActiveValue && element === document.activeElement) {
        return true;
      }
      return ctx.callbacks.beforeAttributeUpdated(attr, element, updateType) === false;
    }
    function ignoreValueOfActiveElement(possibleActiveElement, ctx) {
      return !!ctx.ignoreActiveValue && possibleActiveElement === document.activeElement && possibleActiveElement !== document.body;
    }
    return morphNode2;
  }();
  function withHeadBlocking(ctx, oldNode, newNode, callback) {
    if (ctx.head.block) {
      const oldHead = oldNode.querySelector("head");
      const newHead = newNode.querySelector("head");
      if (oldHead && newHead) {
        const promises = handleHeadElement(oldHead, newHead, ctx);
        return Promise.all(promises).then(() => {
          const newCtx = Object.assign(ctx, {
            head: {
              block: false,
              ignore: true
            }
          });
          return callback(newCtx);
        });
      }
    }
    return callback(ctx);
  }
  function handleHeadElement(oldHead, newHead, ctx) {
    let added = [];
    let removed = [];
    let preserved = [];
    let nodesToAppend = [];
    let srcToNewHeadNodes = /* @__PURE__ */ new Map();
    for (const newHeadChild of newHead.children) {
      srcToNewHeadNodes.set(newHeadChild.outerHTML, newHeadChild);
    }
    for (const currentHeadElt of oldHead.children) {
      let inNewContent = srcToNewHeadNodes.has(currentHeadElt.outerHTML);
      let isReAppended = ctx.head.shouldReAppend(currentHeadElt);
      let isPreserved = ctx.head.shouldPreserve(currentHeadElt);
      if (inNewContent || isPreserved) {
        if (isReAppended) {
          removed.push(currentHeadElt);
        } else {
          srcToNewHeadNodes.delete(currentHeadElt.outerHTML);
          preserved.push(currentHeadElt);
        }
      } else {
        if (ctx.head.style === "append") {
          if (isReAppended) {
            removed.push(currentHeadElt);
            nodesToAppend.push(currentHeadElt);
          }
        } else {
          if (ctx.head.shouldRemove(currentHeadElt) !== false) {
            removed.push(currentHeadElt);
          }
        }
      }
    }
    nodesToAppend.push(...srcToNewHeadNodes.values());
    let promises = [];
    for (const newNode of nodesToAppend) {
      let newElt = (
        /** @type {ChildNode} */
        document.createRange().createContextualFragment(newNode.outerHTML).firstChild
      );
      if (ctx.callbacks.beforeNodeAdded(newElt) !== false) {
        if ("href" in newElt && newElt.href || "src" in newElt && newElt.src) {
          let resolve;
          let promise = new Promise(function(_resolve) {
            resolve = _resolve;
          });
          newElt.addEventListener("load", function() {
            resolve();
          });
          promises.push(promise);
        }
        oldHead.appendChild(newElt);
        ctx.callbacks.afterNodeAdded(newElt);
        added.push(newElt);
      }
    }
    for (const removedElement of removed) {
      if (ctx.callbacks.beforeNodeRemoved(removedElement) !== false) {
        oldHead.removeChild(removedElement);
        ctx.callbacks.afterNodeRemoved(removedElement);
      }
    }
    ctx.head.afterHeadMorphed(oldHead, {
      added,
      kept: preserved,
      removed
    });
    return promises;
  }
  const createMorphContext = /* @__PURE__ */ function() {
    function createMorphContext2(oldNode, newContent, config2) {
      const { persistentIds, idMap } = createIdMaps(oldNode, newContent);
      const mergedConfig = mergeDefaults(config2);
      const morphStyle = mergedConfig.morphStyle || "outerHTML";
      if (!["innerHTML", "outerHTML"].includes(morphStyle)) {
        throw `Do not understand how to morph style ${morphStyle}`;
      }
      return {
        target: oldNode,
        newContent,
        config: mergedConfig,
        morphStyle,
        ignoreActive: mergedConfig.ignoreActive,
        ignoreActiveValue: mergedConfig.ignoreActiveValue,
        restoreFocus: mergedConfig.restoreFocus,
        idMap,
        persistentIds,
        pantry: createPantry(),
        callbacks: mergedConfig.callbacks,
        head: mergedConfig.head
      };
    }
    function mergeDefaults(config2) {
      let finalConfig = Object.assign({}, defaults);
      Object.assign(finalConfig, config2);
      finalConfig.callbacks = Object.assign(
        {},
        defaults.callbacks,
        config2.callbacks
      );
      finalConfig.head = Object.assign({}, defaults.head, config2.head);
      return finalConfig;
    }
    function createPantry() {
      const pantry = document.createElement("div");
      pantry.hidden = true;
      document.body.insertAdjacentElement("afterend", pantry);
      return pantry;
    }
    function findIdElements(root) {
      let elements = Array.from(root.querySelectorAll("[id]"));
      if (root.id) {
        elements.push(root);
      }
      return elements;
    }
    function populateIdMapWithTree(idMap, persistentIds, root, elements) {
      for (const elt of elements) {
        if (persistentIds.has(elt.id)) {
          let current = elt;
          while (current) {
            let idSet = idMap.get(current);
            if (idSet == null) {
              idSet = /* @__PURE__ */ new Set();
              idMap.set(current, idSet);
            }
            idSet.add(elt.id);
            if (current === root) break;
            current = current.parentElement;
          }
        }
      }
    }
    function createIdMaps(oldContent, newContent) {
      const oldIdElements = findIdElements(oldContent);
      const newIdElements = findIdElements(newContent);
      const persistentIds = createPersistentIds(oldIdElements, newIdElements);
      let idMap = /* @__PURE__ */ new Map();
      populateIdMapWithTree(idMap, persistentIds, oldContent, oldIdElements);
      const newRoot = newContent.__idiomorphRoot || newContent;
      populateIdMapWithTree(idMap, persistentIds, newRoot, newIdElements);
      return { persistentIds, idMap };
    }
    function createPersistentIds(oldIdElements, newIdElements) {
      let duplicateIds = /* @__PURE__ */ new Set();
      let oldIdTagNameMap = /* @__PURE__ */ new Map();
      for (const { id: id2, tagName } of oldIdElements) {
        if (oldIdTagNameMap.has(id2)) {
          duplicateIds.add(id2);
        } else {
          oldIdTagNameMap.set(id2, tagName);
        }
      }
      let persistentIds = /* @__PURE__ */ new Set();
      for (const { id: id2, tagName } of newIdElements) {
        if (persistentIds.has(id2)) {
          duplicateIds.add(id2);
        } else if (oldIdTagNameMap.get(id2) === tagName) {
          persistentIds.add(id2);
        }
      }
      for (const id2 of duplicateIds) {
        persistentIds.delete(id2);
      }
      return persistentIds;
    }
    return createMorphContext2;
  }();
  const { normalizeElement, normalizeParent } = /* @__PURE__ */ function() {
    const generatedByIdiomorph = /* @__PURE__ */ new WeakSet();
    function normalizeElement2(content) {
      if (content instanceof Document) {
        return content.documentElement;
      } else {
        return content;
      }
    }
    function normalizeParent2(newContent) {
      if (newContent == null) {
        return document.createElement("div");
      } else if (typeof newContent === "string") {
        return normalizeParent2(parseContent(newContent));
      } else if (generatedByIdiomorph.has(
        /** @type {Element} */
        newContent
      )) {
        return (
          /** @type {Element} */
          newContent
        );
      } else if (newContent instanceof Node) {
        if (newContent.parentNode) {
          return createDuckTypedParent(newContent);
        } else {
          const dummyParent = document.createElement("div");
          dummyParent.append(newContent);
          return dummyParent;
        }
      } else {
        const dummyParent = document.createElement("div");
        for (const elt of [...newContent]) {
          dummyParent.append(elt);
        }
        return dummyParent;
      }
    }
    function createDuckTypedParent(newContent) {
      return (
        /** @type {Element} */
        /** @type {unknown} */
        {
          childNodes: [newContent],
          /** @ts-ignore - cover your eyes for a minute, tsc */
          querySelectorAll: (s2) => {
            const elements = newContent.querySelectorAll(s2);
            return newContent.matches(s2) ? [newContent, ...elements] : elements;
          },
          /** @ts-ignore */
          insertBefore: (n2, r2) => newContent.parentNode.insertBefore(n2, r2),
          /** @ts-ignore */
          moveBefore: (n2, r2) => newContent.parentNode.moveBefore(n2, r2),
          // for later use with populateIdMapWithTree to halt upwards iteration
          get __idiomorphRoot() {
            return newContent;
          }
        }
      );
    }
    function parseContent(newContent) {
      let parser = new DOMParser();
      let contentWithSvgsRemoved = newContent.replace(
        /<svg(\s[^>]*>|>)([\s\S]*?)<\/svg>/gim,
        ""
      );
      if (contentWithSvgsRemoved.match(/<\/html>/) || contentWithSvgsRemoved.match(/<\/head>/) || contentWithSvgsRemoved.match(/<\/body>/)) {
        let content = parser.parseFromString(newContent, "text/html");
        if (contentWithSvgsRemoved.match(/<\/html>/)) {
          generatedByIdiomorph.add(content);
          return content;
        } else {
          let htmlElement = content.firstChild;
          if (htmlElement) {
            generatedByIdiomorph.add(htmlElement);
          }
          return htmlElement;
        }
      } else {
        let responseDoc = parser.parseFromString(
          "<body><template>" + newContent + "</template></body>",
          "text/html"
        );
        let content = (
          /** @type {HTMLTemplateElement} */
          responseDoc.body.querySelector("template").content
        );
        generatedByIdiomorph.add(content);
        return content;
      }
    }
    return { normalizeElement: normalizeElement2, normalizeParent: normalizeParent2 };
  }();
  return {
    morph,
    defaults
  };
}();
function morphElements(currentElement, newElement, { callbacks, ...options } = {}) {
  Idiomorph.morph(currentElement, newElement, {
    ...options,
    callbacks: new DefaultIdiomorphCallbacks(callbacks)
  });
}
function morphChildren(currentElement, newElement) {
  morphElements(currentElement, newElement.childNodes, {
    morphStyle: "innerHTML"
  });
}
var DefaultIdiomorphCallbacks = class {
  #beforeNodeMorphed;
  constructor({ beforeNodeMorphed } = {}) {
    this.#beforeNodeMorphed = beforeNodeMorphed || (() => true);
  }
  beforeNodeAdded = (node) => {
    return !(node.id && node.hasAttribute("data-turbo-permanent") && document.getElementById(node.id));
  };
  beforeNodeMorphed = (currentElement, newElement) => {
    if (currentElement instanceof Element) {
      if (!currentElement.hasAttribute("data-turbo-permanent") && this.#beforeNodeMorphed(currentElement, newElement)) {
        const event = dispatch("turbo:before-morph-element", {
          cancelable: true,
          target: currentElement,
          detail: { currentElement, newElement }
        });
        return !event.defaultPrevented;
      } else {
        return false;
      }
    }
  };
  beforeAttributeUpdated = (attributeName, target, mutationType) => {
    const event = dispatch("turbo:before-morph-attribute", {
      cancelable: true,
      target,
      detail: { attributeName, mutationType }
    });
    return !event.defaultPrevented;
  };
  beforeNodeRemoved = (node) => {
    return this.beforeNodeMorphed(node);
  };
  afterNodeMorphed = (currentElement, newElement) => {
    if (currentElement instanceof Element) {
      dispatch("turbo:morph-element", {
        target: currentElement,
        detail: { currentElement, newElement }
      });
    }
  };
};
var MorphingFrameRenderer = class extends FrameRenderer {
  static renderElement(currentElement, newElement) {
    dispatch("turbo:before-frame-morph", {
      target: currentElement,
      detail: { currentElement, newElement }
    });
    morphChildren(currentElement, newElement);
  }
  async preservingPermanentElements(callback) {
    return await callback();
  }
};
var ProgressBar = class _ProgressBar {
  static animationDuration = 300;
  /*ms*/
  static get defaultCSS() {
    return unindent`
      .turbo-progress-bar {
        position: fixed;
        display: block;
        top: 0;
        left: 0;
        height: 3px;
        background: #0076ff;
        z-index: 2147483647;
        transition:
          width ${_ProgressBar.animationDuration}ms ease-out,
          opacity ${_ProgressBar.animationDuration / 2}ms ${_ProgressBar.animationDuration / 2}ms ease-in;
        transform: translate3d(0, 0, 0);
      }
    `;
  }
  hiding = false;
  value = 0;
  visible = false;
  constructor() {
    this.stylesheetElement = this.createStylesheetElement();
    this.progressElement = this.createProgressElement();
    this.installStylesheetElement();
    this.setValue(0);
  }
  show() {
    if (!this.visible) {
      this.visible = true;
      this.installProgressElement();
      this.startTrickling();
    }
  }
  hide() {
    if (this.visible && !this.hiding) {
      this.hiding = true;
      this.fadeProgressElement(() => {
        this.uninstallProgressElement();
        this.stopTrickling();
        this.visible = false;
        this.hiding = false;
      });
    }
  }
  setValue(value) {
    this.value = value;
    this.refresh();
  }
  // Private
  installStylesheetElement() {
    document.head.insertBefore(this.stylesheetElement, document.head.firstChild);
  }
  installProgressElement() {
    this.progressElement.style.width = "0";
    this.progressElement.style.opacity = "1";
    document.documentElement.insertBefore(this.progressElement, document.body);
    this.refresh();
  }
  fadeProgressElement(callback) {
    this.progressElement.style.opacity = "0";
    setTimeout(callback, _ProgressBar.animationDuration * 1.5);
  }
  uninstallProgressElement() {
    if (this.progressElement.parentNode) {
      document.documentElement.removeChild(this.progressElement);
    }
  }
  startTrickling() {
    if (!this.trickleInterval) {
      this.trickleInterval = window.setInterval(this.trickle, _ProgressBar.animationDuration);
    }
  }
  stopTrickling() {
    window.clearInterval(this.trickleInterval);
    delete this.trickleInterval;
  }
  trickle = () => {
    this.setValue(this.value + Math.random() / 100);
  };
  refresh() {
    requestAnimationFrame(() => {
      this.progressElement.style.width = `${10 + this.value * 90}%`;
    });
  }
  createStylesheetElement() {
    const element = document.createElement("style");
    element.type = "text/css";
    element.textContent = _ProgressBar.defaultCSS;
    const cspNonce = getCspNonce();
    if (cspNonce) {
      element.nonce = cspNonce;
    }
    return element;
  }
  createProgressElement() {
    const element = document.createElement("div");
    element.className = "turbo-progress-bar";
    return element;
  }
};
var HeadSnapshot = class extends Snapshot {
  detailsByOuterHTML = this.children.filter((element) => !elementIsNoscript(element)).map((element) => elementWithoutNonce(element)).reduce((result, element) => {
    const { outerHTML } = element;
    const details = outerHTML in result ? result[outerHTML] : {
      type: elementType(element),
      tracked: elementIsTracked(element),
      elements: []
    };
    return {
      ...result,
      [outerHTML]: {
        ...details,
        elements: [...details.elements, element]
      }
    };
  }, {});
  get trackedElementSignature() {
    return Object.keys(this.detailsByOuterHTML).filter((outerHTML) => this.detailsByOuterHTML[outerHTML].tracked).join("");
  }
  getScriptElementsNotInSnapshot(snapshot) {
    return this.getElementsMatchingTypeNotInSnapshot("script", snapshot);
  }
  getStylesheetElementsNotInSnapshot(snapshot) {
    return this.getElementsMatchingTypeNotInSnapshot("stylesheet", snapshot);
  }
  getElementsMatchingTypeNotInSnapshot(matchedType, snapshot) {
    return Object.keys(this.detailsByOuterHTML).filter((outerHTML) => !(outerHTML in snapshot.detailsByOuterHTML)).map((outerHTML) => this.detailsByOuterHTML[outerHTML]).filter(({ type }) => type == matchedType).map(({ elements: [element] }) => element);
  }
  get provisionalElements() {
    return Object.keys(this.detailsByOuterHTML).reduce((result, outerHTML) => {
      const { type, tracked, elements } = this.detailsByOuterHTML[outerHTML];
      if (type == null && !tracked) {
        return [...result, ...elements];
      } else if (elements.length > 1) {
        return [...result, ...elements.slice(1)];
      } else {
        return result;
      }
    }, []);
  }
  getMetaValue(name) {
    const element = this.findMetaElementByName(name);
    return element ? element.getAttribute("content") : null;
  }
  findMetaElementByName(name) {
    return Object.keys(this.detailsByOuterHTML).reduce((result, outerHTML) => {
      const {
        elements: [element]
      } = this.detailsByOuterHTML[outerHTML];
      return elementIsMetaElementWithName(element, name) ? element : result;
    }, void 0 | void 0);
  }
};
function elementType(element) {
  if (elementIsScript(element)) {
    return "script";
  } else if (elementIsStylesheet(element)) {
    return "stylesheet";
  }
}
function elementIsTracked(element) {
  return element.getAttribute("data-turbo-track") == "reload";
}
function elementIsScript(element) {
  const tagName = element.localName;
  return tagName == "script";
}
function elementIsNoscript(element) {
  const tagName = element.localName;
  return tagName == "noscript";
}
function elementIsStylesheet(element) {
  const tagName = element.localName;
  return tagName == "style" || tagName == "link" && element.getAttribute("rel") == "stylesheet";
}
function elementIsMetaElementWithName(element, name) {
  const tagName = element.localName;
  return tagName == "meta" && element.getAttribute("name") == name;
}
function elementWithoutNonce(element) {
  if (element.hasAttribute("nonce")) {
    element.setAttribute("nonce", "");
  }
  return element;
}
var PageSnapshot = class _PageSnapshot extends Snapshot {
  static fromHTMLString(html = "") {
    return this.fromDocument(parseHTMLDocument(html));
  }
  static fromElement(element) {
    return this.fromDocument(element.ownerDocument);
  }
  static fromDocument({ documentElement, body, head }) {
    return new this(documentElement, body, new HeadSnapshot(head));
  }
  constructor(documentElement, body, headSnapshot) {
    super(body);
    this.documentElement = documentElement;
    this.headSnapshot = headSnapshot;
  }
  clone() {
    const clonedElement = this.element.cloneNode(true);
    const selectElements = this.element.querySelectorAll("select");
    const clonedSelectElements = clonedElement.querySelectorAll("select");
    for (const [index, source] of selectElements.entries()) {
      const clone = clonedSelectElements[index];
      for (const option of clone.selectedOptions) option.selected = false;
      for (const option of source.selectedOptions) clone.options[option.index].selected = true;
    }
    for (const clonedPasswordInput of clonedElement.querySelectorAll('input[type="password"]')) {
      clonedPasswordInput.value = "";
    }
    return new _PageSnapshot(this.documentElement, clonedElement, this.headSnapshot);
  }
  get lang() {
    return this.documentElement.getAttribute("lang");
  }
  get headElement() {
    return this.headSnapshot.element;
  }
  get rootLocation() {
    const root = this.getSetting("root") ?? "/";
    return expandURL(root);
  }
  get cacheControlValue() {
    return this.getSetting("cache-control");
  }
  get isPreviewable() {
    return this.cacheControlValue != "no-preview";
  }
  get isCacheable() {
    return this.cacheControlValue != "no-cache";
  }
  get isVisitable() {
    return this.getSetting("visit-control") != "reload";
  }
  get prefersViewTransitions() {
    return this.headSnapshot.getMetaValue("view-transition") === "same-origin";
  }
  get shouldMorphPage() {
    return this.getSetting("refresh-method") === "morph";
  }
  get shouldPreserveScrollPosition() {
    return this.getSetting("refresh-scroll") === "preserve";
  }
  // Private
  getSetting(name) {
    return this.headSnapshot.getMetaValue(`turbo-${name}`);
  }
};
var ViewTransitioner = class {
  #viewTransitionStarted = false;
  #lastOperation = Promise.resolve();
  renderChange(useViewTransition, render) {
    if (useViewTransition && this.viewTransitionsAvailable && !this.#viewTransitionStarted) {
      this.#viewTransitionStarted = true;
      this.#lastOperation = this.#lastOperation.then(async () => {
        await document.startViewTransition(render).finished;
      });
    } else {
      this.#lastOperation = this.#lastOperation.then(render);
    }
    return this.#lastOperation;
  }
  get viewTransitionsAvailable() {
    return document.startViewTransition;
  }
};
var defaultOptions = {
  action: "advance",
  historyChanged: false,
  visitCachedSnapshot: () => {
  },
  willRender: true,
  updateHistory: true,
  shouldCacheSnapshot: true,
  acceptsStreamResponse: false
};
var TimingMetric = {
  visitStart: "visitStart",
  requestStart: "requestStart",
  requestEnd: "requestEnd",
  visitEnd: "visitEnd"
};
var VisitState = {
  initialized: "initialized",
  started: "started",
  canceled: "canceled",
  failed: "failed",
  completed: "completed"
};
var SystemStatusCode = {
  networkFailure: 0,
  timeoutFailure: -1,
  contentTypeMismatch: -2
};
var Direction = {
  advance: "forward",
  restore: "back",
  replace: "none"
};
var Visit = class {
  identifier = uuid();
  // Required by turbo-ios
  timingMetrics = {};
  followedRedirect = false;
  historyChanged = false;
  scrolled = false;
  shouldCacheSnapshot = true;
  acceptsStreamResponse = false;
  snapshotCached = false;
  state = VisitState.initialized;
  viewTransitioner = new ViewTransitioner();
  constructor(delegate, location2, restorationIdentifier, options = {}) {
    this.delegate = delegate;
    this.location = location2;
    this.restorationIdentifier = restorationIdentifier || uuid();
    const {
      action,
      historyChanged,
      referrer,
      snapshot,
      snapshotHTML,
      response,
      visitCachedSnapshot,
      willRender,
      updateHistory,
      shouldCacheSnapshot,
      acceptsStreamResponse,
      direction
    } = {
      ...defaultOptions,
      ...options
    };
    this.action = action;
    this.historyChanged = historyChanged;
    this.referrer = referrer;
    this.snapshot = snapshot;
    this.snapshotHTML = snapshotHTML;
    this.response = response;
    this.isSamePage = this.delegate.locationWithActionIsSamePage(this.location, this.action);
    this.isPageRefresh = this.view.isPageRefresh(this);
    this.visitCachedSnapshot = visitCachedSnapshot;
    this.willRender = willRender;
    this.updateHistory = updateHistory;
    this.scrolled = !willRender;
    this.shouldCacheSnapshot = shouldCacheSnapshot;
    this.acceptsStreamResponse = acceptsStreamResponse;
    this.direction = direction || Direction[action];
  }
  get adapter() {
    return this.delegate.adapter;
  }
  get view() {
    return this.delegate.view;
  }
  get history() {
    return this.delegate.history;
  }
  get restorationData() {
    return this.history.getRestorationDataForIdentifier(this.restorationIdentifier);
  }
  get silent() {
    return this.isSamePage;
  }
  start() {
    if (this.state == VisitState.initialized) {
      this.recordTimingMetric(TimingMetric.visitStart);
      this.state = VisitState.started;
      this.adapter.visitStarted(this);
      this.delegate.visitStarted(this);
    }
  }
  cancel() {
    if (this.state == VisitState.started) {
      if (this.request) {
        this.request.cancel();
      }
      this.cancelRender();
      this.state = VisitState.canceled;
    }
  }
  complete() {
    if (this.state == VisitState.started) {
      this.recordTimingMetric(TimingMetric.visitEnd);
      this.adapter.visitCompleted(this);
      this.state = VisitState.completed;
      this.followRedirect();
      if (!this.followedRedirect) {
        this.delegate.visitCompleted(this);
      }
    }
  }
  fail() {
    if (this.state == VisitState.started) {
      this.state = VisitState.failed;
      this.adapter.visitFailed(this);
      this.delegate.visitCompleted(this);
    }
  }
  changeHistory() {
    if (!this.historyChanged && this.updateHistory) {
      const actionForHistory = this.location.href === this.referrer?.href ? "replace" : this.action;
      const method = getHistoryMethodForAction(actionForHistory);
      this.history.update(method, this.location, this.restorationIdentifier);
      this.historyChanged = true;
    }
  }
  issueRequest() {
    if (this.hasPreloadedResponse()) {
      this.simulateRequest();
    } else if (this.shouldIssueRequest() && !this.request) {
      this.request = new FetchRequest(this, FetchMethod.get, this.location);
      this.request.perform();
    }
  }
  simulateRequest() {
    if (this.response) {
      this.startRequest();
      this.recordResponse();
      this.finishRequest();
    }
  }
  startRequest() {
    this.recordTimingMetric(TimingMetric.requestStart);
    this.adapter.visitRequestStarted(this);
  }
  recordResponse(response = this.response) {
    this.response = response;
    if (response) {
      const { statusCode } = response;
      if (isSuccessful(statusCode)) {
        this.adapter.visitRequestCompleted(this);
      } else {
        this.adapter.visitRequestFailedWithStatusCode(this, statusCode);
      }
    }
  }
  finishRequest() {
    this.recordTimingMetric(TimingMetric.requestEnd);
    this.adapter.visitRequestFinished(this);
  }
  loadResponse() {
    if (this.response) {
      const { statusCode, responseHTML } = this.response;
      this.render(async () => {
        if (this.shouldCacheSnapshot) this.cacheSnapshot();
        if (this.view.renderPromise) await this.view.renderPromise;
        if (isSuccessful(statusCode) && responseHTML != null) {
          const snapshot = PageSnapshot.fromHTMLString(responseHTML);
          await this.renderPageSnapshot(snapshot, false);
          this.adapter.visitRendered(this);
          this.complete();
        } else {
          await this.view.renderError(PageSnapshot.fromHTMLString(responseHTML), this);
          this.adapter.visitRendered(this);
          this.fail();
        }
      });
    }
  }
  getCachedSnapshot() {
    const snapshot = this.view.getCachedSnapshotForLocation(this.location) || this.getPreloadedSnapshot();
    if (snapshot && (!getAnchor(this.location) || snapshot.hasAnchor(getAnchor(this.location)))) {
      if (this.action == "restore" || snapshot.isPreviewable) {
        return snapshot;
      }
    }
  }
  getPreloadedSnapshot() {
    if (this.snapshotHTML) {
      return PageSnapshot.fromHTMLString(this.snapshotHTML);
    }
  }
  hasCachedSnapshot() {
    return this.getCachedSnapshot() != null;
  }
  loadCachedSnapshot() {
    const snapshot = this.getCachedSnapshot();
    if (snapshot) {
      const isPreview = this.shouldIssueRequest();
      this.render(async () => {
        this.cacheSnapshot();
        if (this.isSamePage || this.isPageRefresh) {
          this.adapter.visitRendered(this);
        } else {
          if (this.view.renderPromise) await this.view.renderPromise;
          await this.renderPageSnapshot(snapshot, isPreview);
          this.adapter.visitRendered(this);
          if (!isPreview) {
            this.complete();
          }
        }
      });
    }
  }
  followRedirect() {
    if (this.redirectedToLocation && !this.followedRedirect && this.response?.redirected) {
      this.adapter.visitProposedToLocation(this.redirectedToLocation, {
        action: "replace",
        response: this.response,
        shouldCacheSnapshot: false,
        willRender: false
      });
      this.followedRedirect = true;
    }
  }
  goToSamePageAnchor() {
    if (this.isSamePage) {
      this.render(async () => {
        this.cacheSnapshot();
        this.performScroll();
        this.changeHistory();
        this.adapter.visitRendered(this);
      });
    }
  }
  // Fetch request delegate
  prepareRequest(request) {
    if (this.acceptsStreamResponse) {
      request.acceptResponseType(StreamMessage.contentType);
    }
  }
  requestStarted() {
    this.startRequest();
  }
  requestPreventedHandlingResponse(_request, _response) {
  }
  async requestSucceededWithResponse(request, response) {
    const responseHTML = await response.responseHTML;
    const { redirected, statusCode } = response;
    if (responseHTML == void 0) {
      this.recordResponse({
        statusCode: SystemStatusCode.contentTypeMismatch,
        redirected
      });
    } else {
      this.redirectedToLocation = response.redirected ? response.location : void 0;
      this.recordResponse({ statusCode, responseHTML, redirected });
    }
  }
  async requestFailedWithResponse(request, response) {
    const responseHTML = await response.responseHTML;
    const { redirected, statusCode } = response;
    if (responseHTML == void 0) {
      this.recordResponse({
        statusCode: SystemStatusCode.contentTypeMismatch,
        redirected
      });
    } else {
      this.recordResponse({ statusCode, responseHTML, redirected });
    }
  }
  requestErrored(_request, _error) {
    this.recordResponse({
      statusCode: SystemStatusCode.networkFailure,
      redirected: false
    });
  }
  requestFinished() {
    this.finishRequest();
  }
  // Scrolling
  performScroll() {
    if (!this.scrolled && !this.view.forceReloaded && !this.view.shouldPreserveScrollPosition(this)) {
      if (this.action == "restore") {
        this.scrollToRestoredPosition() || this.scrollToAnchor() || this.view.scrollToTop();
      } else {
        this.scrollToAnchor() || this.view.scrollToTop();
      }
      if (this.isSamePage) {
        this.delegate.visitScrolledToSamePageLocation(this.view.lastRenderedLocation, this.location);
      }
      this.scrolled = true;
    }
  }
  scrollToRestoredPosition() {
    const { scrollPosition } = this.restorationData;
    if (scrollPosition) {
      this.view.scrollToPosition(scrollPosition);
      return true;
    }
  }
  scrollToAnchor() {
    const anchor = getAnchor(this.location);
    if (anchor != null) {
      this.view.scrollToAnchor(anchor);
      return true;
    }
  }
  // Instrumentation
  recordTimingMetric(metric) {
    this.timingMetrics[metric] = (/* @__PURE__ */ new Date()).getTime();
  }
  getTimingMetrics() {
    return { ...this.timingMetrics };
  }
  // Private
  hasPreloadedResponse() {
    return typeof this.response == "object";
  }
  shouldIssueRequest() {
    if (this.isSamePage) {
      return false;
    } else if (this.action == "restore") {
      return !this.hasCachedSnapshot();
    } else {
      return this.willRender;
    }
  }
  cacheSnapshot() {
    if (!this.snapshotCached) {
      this.view.cacheSnapshot(this.snapshot).then((snapshot) => snapshot && this.visitCachedSnapshot(snapshot));
      this.snapshotCached = true;
    }
  }
  async render(callback) {
    this.cancelRender();
    await new Promise((resolve) => {
      this.frame = document.visibilityState === "hidden" ? setTimeout(() => resolve(), 0) : requestAnimationFrame(() => resolve());
    });
    await callback();
    delete this.frame;
  }
  async renderPageSnapshot(snapshot, isPreview) {
    await this.viewTransitioner.renderChange(this.view.shouldTransitionTo(snapshot), async () => {
      await this.view.renderPage(snapshot, isPreview, this.willRender, this);
      this.performScroll();
    });
  }
  cancelRender() {
    if (this.frame) {
      cancelAnimationFrame(this.frame);
      delete this.frame;
    }
  }
};
function isSuccessful(statusCode) {
  return statusCode >= 200 && statusCode < 300;
}
var BrowserAdapter = class {
  progressBar = new ProgressBar();
  constructor(session2) {
    this.session = session2;
  }
  visitProposedToLocation(location2, options) {
    if (locationIsVisitable(location2, this.navigator.rootLocation)) {
      this.navigator.startVisit(location2, options?.restorationIdentifier || uuid(), options);
    } else {
      window.location.href = location2.toString();
    }
  }
  visitStarted(visit2) {
    this.location = visit2.location;
    visit2.loadCachedSnapshot();
    visit2.issueRequest();
    visit2.goToSamePageAnchor();
  }
  visitRequestStarted(visit2) {
    this.progressBar.setValue(0);
    if (visit2.hasCachedSnapshot() || visit2.action != "restore") {
      this.showVisitProgressBarAfterDelay();
    } else {
      this.showProgressBar();
    }
  }
  visitRequestCompleted(visit2) {
    visit2.loadResponse();
  }
  visitRequestFailedWithStatusCode(visit2, statusCode) {
    switch (statusCode) {
      case SystemStatusCode.networkFailure:
      case SystemStatusCode.timeoutFailure:
      case SystemStatusCode.contentTypeMismatch:
        return this.reload({
          reason: "request_failed",
          context: {
            statusCode
          }
        });
      default:
        return visit2.loadResponse();
    }
  }
  visitRequestFinished(_visit) {
  }
  visitCompleted(_visit) {
    this.progressBar.setValue(1);
    this.hideVisitProgressBar();
  }
  pageInvalidated(reason) {
    this.reload(reason);
  }
  visitFailed(_visit) {
    this.progressBar.setValue(1);
    this.hideVisitProgressBar();
  }
  visitRendered(_visit) {
  }
  // Link prefetching
  linkPrefetchingIsEnabledForLocation(location2) {
    return true;
  }
  // Form Submission Delegate
  formSubmissionStarted(_formSubmission) {
    this.progressBar.setValue(0);
    this.showFormProgressBarAfterDelay();
  }
  formSubmissionFinished(_formSubmission) {
    this.progressBar.setValue(1);
    this.hideFormProgressBar();
  }
  // Private
  showVisitProgressBarAfterDelay() {
    this.visitProgressBarTimeout = window.setTimeout(this.showProgressBar, this.session.progressBarDelay);
  }
  hideVisitProgressBar() {
    this.progressBar.hide();
    if (this.visitProgressBarTimeout != null) {
      window.clearTimeout(this.visitProgressBarTimeout);
      delete this.visitProgressBarTimeout;
    }
  }
  showFormProgressBarAfterDelay() {
    if (this.formProgressBarTimeout == null) {
      this.formProgressBarTimeout = window.setTimeout(this.showProgressBar, this.session.progressBarDelay);
    }
  }
  hideFormProgressBar() {
    this.progressBar.hide();
    if (this.formProgressBarTimeout != null) {
      window.clearTimeout(this.formProgressBarTimeout);
      delete this.formProgressBarTimeout;
    }
  }
  showProgressBar = () => {
    this.progressBar.show();
  };
  reload(reason) {
    dispatch("turbo:reload", { detail: reason });
    window.location.href = this.location?.toString() || window.location.href;
  }
  get navigator() {
    return this.session.navigator;
  }
};
var CacheObserver = class {
  selector = "[data-turbo-temporary]";
  deprecatedSelector = "[data-turbo-cache=false]";
  started = false;
  start() {
    if (!this.started) {
      this.started = true;
      addEventListener("turbo:before-cache", this.removeTemporaryElements, false);
    }
  }
  stop() {
    if (this.started) {
      this.started = false;
      removeEventListener("turbo:before-cache", this.removeTemporaryElements, false);
    }
  }
  removeTemporaryElements = (_event) => {
    for (const element of this.temporaryElements) {
      element.remove();
    }
  };
  get temporaryElements() {
    return [...document.querySelectorAll(this.selector), ...this.temporaryElementsWithDeprecation];
  }
  get temporaryElementsWithDeprecation() {
    const elements = document.querySelectorAll(this.deprecatedSelector);
    if (elements.length) {
      console.warn(
        `The ${this.deprecatedSelector} selector is deprecated and will be removed in a future version. Use ${this.selector} instead.`
      );
    }
    return [...elements];
  }
};
var FrameRedirector = class {
  constructor(session2, element) {
    this.session = session2;
    this.element = element;
    this.linkInterceptor = new LinkInterceptor(this, element);
    this.formSubmitObserver = new FormSubmitObserver(this, element);
  }
  start() {
    this.linkInterceptor.start();
    this.formSubmitObserver.start();
  }
  stop() {
    this.linkInterceptor.stop();
    this.formSubmitObserver.stop();
  }
  // Link interceptor delegate
  shouldInterceptLinkClick(element, _location, _event) {
    return this.#shouldRedirect(element);
  }
  linkClickIntercepted(element, url, event) {
    const frame = this.#findFrameElement(element);
    if (frame) {
      frame.delegate.linkClickIntercepted(element, url, event);
    }
  }
  // Form submit observer delegate
  willSubmitForm(element, submitter2) {
    return element.closest("turbo-frame") == null && this.#shouldSubmit(element, submitter2) && this.#shouldRedirect(element, submitter2);
  }
  formSubmitted(element, submitter2) {
    const frame = this.#findFrameElement(element, submitter2);
    if (frame) {
      frame.delegate.formSubmitted(element, submitter2);
    }
  }
  #shouldSubmit(form, submitter2) {
    const action = getAction$1(form, submitter2);
    const meta = this.element.ownerDocument.querySelector(`meta[name="turbo-root"]`);
    const rootLocation = expandURL(meta?.content ?? "/");
    return this.#shouldRedirect(form, submitter2) && locationIsVisitable(action, rootLocation);
  }
  #shouldRedirect(element, submitter2) {
    const isNavigatable = element instanceof HTMLFormElement ? this.session.submissionIsNavigatable(element, submitter2) : this.session.elementIsNavigatable(element);
    if (isNavigatable) {
      const frame = this.#findFrameElement(element, submitter2);
      return frame ? frame != element.closest("turbo-frame") : false;
    } else {
      return false;
    }
  }
  #findFrameElement(element, submitter2) {
    const id2 = submitter2?.getAttribute("data-turbo-frame") || element.getAttribute("data-turbo-frame");
    if (id2 && id2 != "_top") {
      const frame = this.element.querySelector(`#${id2}:not([disabled])`);
      if (frame instanceof FrameElement) {
        return frame;
      }
    }
  }
};
var History = class {
  location;
  restorationIdentifier = uuid();
  restorationData = {};
  started = false;
  pageLoaded = false;
  currentIndex = 0;
  constructor(delegate) {
    this.delegate = delegate;
  }
  start() {
    if (!this.started) {
      addEventListener("popstate", this.onPopState, false);
      addEventListener("load", this.onPageLoad, false);
      this.currentIndex = history.state?.turbo?.restorationIndex || 0;
      this.started = true;
      this.replace(new URL(window.location.href));
    }
  }
  stop() {
    if (this.started) {
      removeEventListener("popstate", this.onPopState, false);
      removeEventListener("load", this.onPageLoad, false);
      this.started = false;
    }
  }
  push(location2, restorationIdentifier) {
    this.update(history.pushState, location2, restorationIdentifier);
  }
  replace(location2, restorationIdentifier) {
    this.update(history.replaceState, location2, restorationIdentifier);
  }
  update(method, location2, restorationIdentifier = uuid()) {
    if (method === history.pushState) ++this.currentIndex;
    const state = { turbo: { restorationIdentifier, restorationIndex: this.currentIndex } };
    method.call(history, state, "", location2.href);
    this.location = location2;
    this.restorationIdentifier = restorationIdentifier;
  }
  // Restoration data
  getRestorationDataForIdentifier(restorationIdentifier) {
    return this.restorationData[restorationIdentifier] || {};
  }
  updateRestorationData(additionalData) {
    const { restorationIdentifier } = this;
    const restorationData = this.restorationData[restorationIdentifier];
    this.restorationData[restorationIdentifier] = {
      ...restorationData,
      ...additionalData
    };
  }
  // Scroll restoration
  assumeControlOfScrollRestoration() {
    if (!this.previousScrollRestoration) {
      this.previousScrollRestoration = history.scrollRestoration ?? "auto";
      history.scrollRestoration = "manual";
    }
  }
  relinquishControlOfScrollRestoration() {
    if (this.previousScrollRestoration) {
      history.scrollRestoration = this.previousScrollRestoration;
      delete this.previousScrollRestoration;
    }
  }
  // Event handlers
  onPopState = (event) => {
    if (this.shouldHandlePopState()) {
      const { turbo } = event.state || {};
      if (turbo) {
        this.location = new URL(window.location.href);
        const { restorationIdentifier, restorationIndex } = turbo;
        this.restorationIdentifier = restorationIdentifier;
        const direction = restorationIndex > this.currentIndex ? "forward" : "back";
        this.delegate.historyPoppedToLocationWithRestorationIdentifierAndDirection(this.location, restorationIdentifier, direction);
        this.currentIndex = restorationIndex;
      }
    }
  };
  onPageLoad = async (_event) => {
    await nextMicrotask();
    this.pageLoaded = true;
  };
  // Private
  shouldHandlePopState() {
    return this.pageIsLoaded();
  }
  pageIsLoaded() {
    return this.pageLoaded || document.readyState == "complete";
  }
};
var LinkPrefetchObserver = class {
  started = false;
  #prefetchedLink = null;
  constructor(delegate, eventTarget) {
    this.delegate = delegate;
    this.eventTarget = eventTarget;
  }
  start() {
    if (this.started) return;
    if (this.eventTarget.readyState === "loading") {
      this.eventTarget.addEventListener("DOMContentLoaded", this.#enable, { once: true });
    } else {
      this.#enable();
    }
  }
  stop() {
    if (!this.started) return;
    this.eventTarget.removeEventListener("mouseenter", this.#tryToPrefetchRequest, {
      capture: true,
      passive: true
    });
    this.eventTarget.removeEventListener("mouseleave", this.#cancelRequestIfObsolete, {
      capture: true,
      passive: true
    });
    this.eventTarget.removeEventListener("turbo:before-fetch-request", this.#tryToUsePrefetchedRequest, true);
    this.started = false;
  }
  #enable = () => {
    this.eventTarget.addEventListener("mouseenter", this.#tryToPrefetchRequest, {
      capture: true,
      passive: true
    });
    this.eventTarget.addEventListener("mouseleave", this.#cancelRequestIfObsolete, {
      capture: true,
      passive: true
    });
    this.eventTarget.addEventListener("turbo:before-fetch-request", this.#tryToUsePrefetchedRequest, true);
    this.started = true;
  };
  #tryToPrefetchRequest = (event) => {
    if (getMetaContent("turbo-prefetch") === "false") return;
    const target = event.target;
    const isLink = target.matches && target.matches("a[href]:not([target^=_]):not([download])");
    if (isLink && this.#isPrefetchable(target)) {
      const link = target;
      const location2 = getLocationForLink(link);
      if (this.delegate.canPrefetchRequestToLocation(link, location2)) {
        this.#prefetchedLink = link;
        const fetchRequest = new FetchRequest(
          this,
          FetchMethod.get,
          location2,
          new URLSearchParams(),
          target
        );
        prefetchCache.setLater(location2.toString(), fetchRequest, this.#cacheTtl);
      }
    }
  };
  #cancelRequestIfObsolete = (event) => {
    if (event.target === this.#prefetchedLink) this.#cancelPrefetchRequest();
  };
  #cancelPrefetchRequest = () => {
    prefetchCache.clear();
    this.#prefetchedLink = null;
  };
  #tryToUsePrefetchedRequest = (event) => {
    if (event.target.tagName !== "FORM" && event.detail.fetchOptions.method === "GET") {
      const cached = prefetchCache.get(event.detail.url.toString());
      if (cached) {
        event.detail.fetchRequest = cached;
      }
      prefetchCache.clear();
    }
  };
  prepareRequest(request) {
    const link = request.target;
    request.headers["X-Sec-Purpose"] = "prefetch";
    const turboFrame = link.closest("turbo-frame");
    const turboFrameTarget = link.getAttribute("data-turbo-frame") || turboFrame?.getAttribute("target") || turboFrame?.id;
    if (turboFrameTarget && turboFrameTarget !== "_top") {
      request.headers["Turbo-Frame"] = turboFrameTarget;
    }
  }
  // Fetch request interface
  requestSucceededWithResponse() {
  }
  requestStarted(fetchRequest) {
  }
  requestErrored(fetchRequest) {
  }
  requestFinished(fetchRequest) {
  }
  requestPreventedHandlingResponse(fetchRequest, fetchResponse) {
  }
  requestFailedWithResponse(fetchRequest, fetchResponse) {
  }
  get #cacheTtl() {
    return Number(getMetaContent("turbo-prefetch-cache-time")) || cacheTtl;
  }
  #isPrefetchable(link) {
    const href = link.getAttribute("href");
    if (!href) return false;
    if (unfetchableLink(link)) return false;
    if (linkToTheSamePage(link)) return false;
    if (linkOptsOut(link)) return false;
    if (nonSafeLink(link)) return false;
    if (eventPrevented(link)) return false;
    return true;
  }
};
var unfetchableLink = (link) => {
  return link.origin !== document.location.origin || !["http:", "https:"].includes(link.protocol) || link.hasAttribute("target");
};
var linkToTheSamePage = (link) => {
  return link.pathname + link.search === document.location.pathname + document.location.search || link.href.startsWith("#");
};
var linkOptsOut = (link) => {
  if (link.getAttribute("data-turbo-prefetch") === "false") return true;
  if (link.getAttribute("data-turbo") === "false") return true;
  const turboPrefetchParent = findClosestRecursively(link, "[data-turbo-prefetch]");
  if (turboPrefetchParent && turboPrefetchParent.getAttribute("data-turbo-prefetch") === "false") return true;
  return false;
};
var nonSafeLink = (link) => {
  const turboMethod = link.getAttribute("data-turbo-method");
  if (turboMethod && turboMethod.toLowerCase() !== "get") return true;
  if (isUJS(link)) return true;
  if (link.hasAttribute("data-turbo-confirm")) return true;
  if (link.hasAttribute("data-turbo-stream")) return true;
  return false;
};
var isUJS = (link) => {
  return link.hasAttribute("data-remote") || link.hasAttribute("data-behavior") || link.hasAttribute("data-confirm") || link.hasAttribute("data-method");
};
var eventPrevented = (link) => {
  const event = dispatch("turbo:before-prefetch", { target: link, cancelable: true });
  return event.defaultPrevented;
};
var Navigator = class {
  constructor(delegate) {
    this.delegate = delegate;
  }
  proposeVisit(location2, options = {}) {
    if (this.delegate.allowsVisitingLocationWithAction(location2, options.action)) {
      this.delegate.visitProposedToLocation(location2, options);
    }
  }
  startVisit(locatable, restorationIdentifier, options = {}) {
    this.stop();
    this.currentVisit = new Visit(this, expandURL(locatable), restorationIdentifier, {
      referrer: this.location,
      ...options
    });
    this.currentVisit.start();
  }
  submitForm(form, submitter2) {
    this.stop();
    this.formSubmission = new FormSubmission(this, form, submitter2, true);
    this.formSubmission.start();
  }
  stop() {
    if (this.formSubmission) {
      this.formSubmission.stop();
      delete this.formSubmission;
    }
    if (this.currentVisit) {
      this.currentVisit.cancel();
      delete this.currentVisit;
    }
  }
  get adapter() {
    return this.delegate.adapter;
  }
  get view() {
    return this.delegate.view;
  }
  get rootLocation() {
    return this.view.snapshot.rootLocation;
  }
  get history() {
    return this.delegate.history;
  }
  // Form submission delegate
  formSubmissionStarted(formSubmission) {
    if (typeof this.adapter.formSubmissionStarted === "function") {
      this.adapter.formSubmissionStarted(formSubmission);
    }
  }
  async formSubmissionSucceededWithResponse(formSubmission, fetchResponse) {
    if (formSubmission == this.formSubmission) {
      const responseHTML = await fetchResponse.responseHTML;
      if (responseHTML) {
        const shouldCacheSnapshot = formSubmission.isSafe;
        if (!shouldCacheSnapshot) {
          this.view.clearSnapshotCache();
        }
        const { statusCode, redirected } = fetchResponse;
        const action = this.#getActionForFormSubmission(formSubmission, fetchResponse);
        const visitOptions = {
          action,
          shouldCacheSnapshot,
          response: { statusCode, responseHTML, redirected }
        };
        this.proposeVisit(fetchResponse.location, visitOptions);
      }
    }
  }
  async formSubmissionFailedWithResponse(formSubmission, fetchResponse) {
    const responseHTML = await fetchResponse.responseHTML;
    if (responseHTML) {
      const snapshot = PageSnapshot.fromHTMLString(responseHTML);
      if (fetchResponse.serverError) {
        await this.view.renderError(snapshot, this.currentVisit);
      } else {
        await this.view.renderPage(snapshot, false, true, this.currentVisit);
      }
      if (!snapshot.shouldPreserveScrollPosition) {
        this.view.scrollToTop();
      }
      this.view.clearSnapshotCache();
    }
  }
  formSubmissionErrored(formSubmission, error2) {
    console.error(error2);
  }
  formSubmissionFinished(formSubmission) {
    if (typeof this.adapter.formSubmissionFinished === "function") {
      this.adapter.formSubmissionFinished(formSubmission);
    }
  }
  // Link prefetching
  linkPrefetchingIsEnabledForLocation(location2) {
    if (typeof this.adapter.linkPrefetchingIsEnabledForLocation === "function") {
      return this.adapter.linkPrefetchingIsEnabledForLocation(location2);
    }
    return true;
  }
  // Visit delegate
  visitStarted(visit2) {
    this.delegate.visitStarted(visit2);
  }
  visitCompleted(visit2) {
    this.delegate.visitCompleted(visit2);
    delete this.currentVisit;
  }
  locationWithActionIsSamePage(location2, action) {
    const anchor = getAnchor(location2);
    const currentAnchor = getAnchor(this.view.lastRenderedLocation);
    const isRestorationToTop = action === "restore" && typeof anchor === "undefined";
    return action !== "replace" && getRequestURL(location2) === getRequestURL(this.view.lastRenderedLocation) && (isRestorationToTop || anchor != null && anchor !== currentAnchor);
  }
  visitScrolledToSamePageLocation(oldURL, newURL) {
    this.delegate.visitScrolledToSamePageLocation(oldURL, newURL);
  }
  // Visits
  get location() {
    return this.history.location;
  }
  get restorationIdentifier() {
    return this.history.restorationIdentifier;
  }
  #getActionForFormSubmission(formSubmission, fetchResponse) {
    const { submitter: submitter2, formElement } = formSubmission;
    return getVisitAction(submitter2, formElement) || this.#getDefaultAction(fetchResponse);
  }
  #getDefaultAction(fetchResponse) {
    const sameLocationRedirect = fetchResponse.redirected && fetchResponse.location.href === this.location?.href;
    return sameLocationRedirect ? "replace" : "advance";
  }
};
var PageStage = {
  initial: 0,
  loading: 1,
  interactive: 2,
  complete: 3
};
var PageObserver = class {
  stage = PageStage.initial;
  started = false;
  constructor(delegate) {
    this.delegate = delegate;
  }
  start() {
    if (!this.started) {
      if (this.stage == PageStage.initial) {
        this.stage = PageStage.loading;
      }
      document.addEventListener("readystatechange", this.interpretReadyState, false);
      addEventListener("pagehide", this.pageWillUnload, false);
      this.started = true;
    }
  }
  stop() {
    if (this.started) {
      document.removeEventListener("readystatechange", this.interpretReadyState, false);
      removeEventListener("pagehide", this.pageWillUnload, false);
      this.started = false;
    }
  }
  interpretReadyState = () => {
    const { readyState } = this;
    if (readyState == "interactive") {
      this.pageIsInteractive();
    } else if (readyState == "complete") {
      this.pageIsComplete();
    }
  };
  pageIsInteractive() {
    if (this.stage == PageStage.loading) {
      this.stage = PageStage.interactive;
      this.delegate.pageBecameInteractive();
    }
  }
  pageIsComplete() {
    this.pageIsInteractive();
    if (this.stage == PageStage.interactive) {
      this.stage = PageStage.complete;
      this.delegate.pageLoaded();
    }
  }
  pageWillUnload = () => {
    this.delegate.pageWillUnload();
  };
  get readyState() {
    return document.readyState;
  }
};
var ScrollObserver = class {
  started = false;
  constructor(delegate) {
    this.delegate = delegate;
  }
  start() {
    if (!this.started) {
      addEventListener("scroll", this.onScroll, false);
      this.onScroll();
      this.started = true;
    }
  }
  stop() {
    if (this.started) {
      removeEventListener("scroll", this.onScroll, false);
      this.started = false;
    }
  }
  onScroll = () => {
    this.updatePosition({ x: window.pageXOffset, y: window.pageYOffset });
  };
  // Private
  updatePosition(position) {
    this.delegate.scrollPositionChanged(position);
  }
};
var StreamMessageRenderer = class {
  render({ fragment }) {
    Bardo.preservingPermanentElements(this, getPermanentElementMapForFragment(fragment), () => {
      withAutofocusFromFragment(fragment, () => {
        withPreservedFocus(() => {
          document.documentElement.appendChild(fragment);
        });
      });
    });
  }
  // Bardo delegate
  enteringBardo(currentPermanentElement, newPermanentElement) {
    newPermanentElement.replaceWith(currentPermanentElement.cloneNode(true));
  }
  leavingBardo() {
  }
};
function getPermanentElementMapForFragment(fragment) {
  const permanentElementsInDocument = queryPermanentElementsAll(document.documentElement);
  const permanentElementMap = {};
  for (const permanentElementInDocument of permanentElementsInDocument) {
    const { id: id2 } = permanentElementInDocument;
    for (const streamElement of fragment.querySelectorAll("turbo-stream")) {
      const elementInStream = getPermanentElementById(streamElement.templateElement.content, id2);
      if (elementInStream) {
        permanentElementMap[id2] = [permanentElementInDocument, elementInStream];
      }
    }
  }
  return permanentElementMap;
}
async function withAutofocusFromFragment(fragment, callback) {
  const generatedID = `turbo-stream-autofocus-${uuid()}`;
  const turboStreams = fragment.querySelectorAll("turbo-stream");
  const elementWithAutofocus = firstAutofocusableElementInStreams(turboStreams);
  let willAutofocusId = null;
  if (elementWithAutofocus) {
    if (elementWithAutofocus.id) {
      willAutofocusId = elementWithAutofocus.id;
    } else {
      willAutofocusId = generatedID;
    }
    elementWithAutofocus.id = willAutofocusId;
  }
  callback();
  await nextRepaint();
  const hasNoActiveElement = document.activeElement == null || document.activeElement == document.body;
  if (hasNoActiveElement && willAutofocusId) {
    const elementToAutofocus = document.getElementById(willAutofocusId);
    if (elementIsFocusable(elementToAutofocus)) {
      elementToAutofocus.focus();
    }
    if (elementToAutofocus && elementToAutofocus.id == generatedID) {
      elementToAutofocus.removeAttribute("id");
    }
  }
}
async function withPreservedFocus(callback) {
  const [activeElementBeforeRender, activeElementAfterRender] = await around(callback, () => document.activeElement);
  const restoreFocusTo = activeElementBeforeRender && activeElementBeforeRender.id;
  if (restoreFocusTo) {
    const elementToFocus = document.getElementById(restoreFocusTo);
    if (elementIsFocusable(elementToFocus) && elementToFocus != activeElementAfterRender) {
      elementToFocus.focus();
    }
  }
}
function firstAutofocusableElementInStreams(nodeListOfStreamElements) {
  for (const streamElement of nodeListOfStreamElements) {
    const elementWithAutofocus = queryAutofocusableElement(streamElement.templateElement.content);
    if (elementWithAutofocus) return elementWithAutofocus;
  }
  return null;
}
var StreamObserver = class {
  sources = /* @__PURE__ */ new Set();
  #started = false;
  constructor(delegate) {
    this.delegate = delegate;
  }
  start() {
    if (!this.#started) {
      this.#started = true;
      addEventListener("turbo:before-fetch-response", this.inspectFetchResponse, false);
    }
  }
  stop() {
    if (this.#started) {
      this.#started = false;
      removeEventListener("turbo:before-fetch-response", this.inspectFetchResponse, false);
    }
  }
  connectStreamSource(source) {
    if (!this.streamSourceIsConnected(source)) {
      this.sources.add(source);
      source.addEventListener("message", this.receiveMessageEvent, false);
    }
  }
  disconnectStreamSource(source) {
    if (this.streamSourceIsConnected(source)) {
      this.sources.delete(source);
      source.removeEventListener("message", this.receiveMessageEvent, false);
    }
  }
  streamSourceIsConnected(source) {
    return this.sources.has(source);
  }
  inspectFetchResponse = (event) => {
    const response = fetchResponseFromEvent(event);
    if (response && fetchResponseIsStream(response)) {
      event.preventDefault();
      this.receiveMessageResponse(response);
    }
  };
  receiveMessageEvent = (event) => {
    if (this.#started && typeof event.data == "string") {
      this.receiveMessageHTML(event.data);
    }
  };
  async receiveMessageResponse(response) {
    const html = await response.responseHTML;
    if (html) {
      this.receiveMessageHTML(html);
    }
  }
  receiveMessageHTML(html) {
    this.delegate.receivedMessageFromStream(StreamMessage.wrap(html));
  }
};
function fetchResponseFromEvent(event) {
  const fetchResponse = event.detail?.fetchResponse;
  if (fetchResponse instanceof FetchResponse) {
    return fetchResponse;
  }
}
function fetchResponseIsStream(response) {
  const contentType = response.contentType ?? "";
  return contentType.startsWith(StreamMessage.contentType);
}
var ErrorRenderer = class extends Renderer {
  static renderElement(currentElement, newElement) {
    const { documentElement, body } = document;
    documentElement.replaceChild(newElement, body);
  }
  async render() {
    this.replaceHeadAndBody();
    this.activateScriptElements();
  }
  replaceHeadAndBody() {
    const { documentElement, head } = document;
    documentElement.replaceChild(this.newHead, head);
    this.renderElement(this.currentElement, this.newElement);
  }
  activateScriptElements() {
    for (const replaceableElement of this.scriptElements) {
      const parentNode = replaceableElement.parentNode;
      if (parentNode) {
        const element = activateScriptElement(replaceableElement);
        parentNode.replaceChild(element, replaceableElement);
      }
    }
  }
  get newHead() {
    return this.newSnapshot.headSnapshot.element;
  }
  get scriptElements() {
    return document.documentElement.querySelectorAll("script");
  }
};
var PageRenderer = class extends Renderer {
  static renderElement(currentElement, newElement) {
    if (document.body && newElement instanceof HTMLBodyElement) {
      document.body.replaceWith(newElement);
    } else {
      document.documentElement.appendChild(newElement);
    }
  }
  get shouldRender() {
    return this.newSnapshot.isVisitable && this.trackedElementsAreIdentical;
  }
  get reloadReason() {
    if (!this.newSnapshot.isVisitable) {
      return {
        reason: "turbo_visit_control_is_reload"
      };
    }
    if (!this.trackedElementsAreIdentical) {
      return {
        reason: "tracked_element_mismatch"
      };
    }
  }
  async prepareToRender() {
    this.#setLanguage();
    await this.mergeHead();
  }
  async render() {
    if (this.willRender) {
      await this.replaceBody();
    }
  }
  finishRendering() {
    super.finishRendering();
    if (!this.isPreview) {
      this.focusFirstAutofocusableElement();
    }
  }
  get currentHeadSnapshot() {
    return this.currentSnapshot.headSnapshot;
  }
  get newHeadSnapshot() {
    return this.newSnapshot.headSnapshot;
  }
  get newElement() {
    return this.newSnapshot.element;
  }
  #setLanguage() {
    const { documentElement } = this.currentSnapshot;
    const { lang } = this.newSnapshot;
    if (lang) {
      documentElement.setAttribute("lang", lang);
    } else {
      documentElement.removeAttribute("lang");
    }
  }
  async mergeHead() {
    const mergedHeadElements = this.mergeProvisionalElements();
    const newStylesheetElements = this.copyNewHeadStylesheetElements();
    this.copyNewHeadScriptElements();
    await mergedHeadElements;
    await newStylesheetElements;
    if (this.willRender) {
      this.removeUnusedDynamicStylesheetElements();
    }
  }
  async replaceBody() {
    await this.preservingPermanentElements(async () => {
      this.activateNewBody();
      await this.assignNewBody();
    });
  }
  get trackedElementsAreIdentical() {
    return this.currentHeadSnapshot.trackedElementSignature == this.newHeadSnapshot.trackedElementSignature;
  }
  async copyNewHeadStylesheetElements() {
    const loadingElements = [];
    for (const element of this.newHeadStylesheetElements) {
      loadingElements.push(waitForLoad(element));
      document.head.appendChild(element);
    }
    await Promise.all(loadingElements);
  }
  copyNewHeadScriptElements() {
    for (const element of this.newHeadScriptElements) {
      document.head.appendChild(activateScriptElement(element));
    }
  }
  removeUnusedDynamicStylesheetElements() {
    for (const element of this.unusedDynamicStylesheetElements) {
      document.head.removeChild(element);
    }
  }
  async mergeProvisionalElements() {
    const newHeadElements = [...this.newHeadProvisionalElements];
    for (const element of this.currentHeadProvisionalElements) {
      if (!this.isCurrentElementInElementList(element, newHeadElements)) {
        document.head.removeChild(element);
      }
    }
    for (const element of newHeadElements) {
      document.head.appendChild(element);
    }
  }
  isCurrentElementInElementList(element, elementList) {
    for (const [index, newElement] of elementList.entries()) {
      if (element.tagName == "TITLE") {
        if (newElement.tagName != "TITLE") {
          continue;
        }
        if (element.innerHTML == newElement.innerHTML) {
          elementList.splice(index, 1);
          return true;
        }
      }
      if (newElement.isEqualNode(element)) {
        elementList.splice(index, 1);
        return true;
      }
    }
    return false;
  }
  removeCurrentHeadProvisionalElements() {
    for (const element of this.currentHeadProvisionalElements) {
      document.head.removeChild(element);
    }
  }
  copyNewHeadProvisionalElements() {
    for (const element of this.newHeadProvisionalElements) {
      document.head.appendChild(element);
    }
  }
  activateNewBody() {
    document.adoptNode(this.newElement);
    this.activateNewBodyScriptElements();
  }
  activateNewBodyScriptElements() {
    for (const inertScriptElement of this.newBodyScriptElements) {
      const activatedScriptElement = activateScriptElement(inertScriptElement);
      inertScriptElement.replaceWith(activatedScriptElement);
    }
  }
  async assignNewBody() {
    await this.renderElement(this.currentElement, this.newElement);
  }
  get unusedDynamicStylesheetElements() {
    return this.oldHeadStylesheetElements.filter((element) => {
      return element.getAttribute("data-turbo-track") === "dynamic";
    });
  }
  get oldHeadStylesheetElements() {
    return this.currentHeadSnapshot.getStylesheetElementsNotInSnapshot(this.newHeadSnapshot);
  }
  get newHeadStylesheetElements() {
    return this.newHeadSnapshot.getStylesheetElementsNotInSnapshot(this.currentHeadSnapshot);
  }
  get newHeadScriptElements() {
    return this.newHeadSnapshot.getScriptElementsNotInSnapshot(this.currentHeadSnapshot);
  }
  get currentHeadProvisionalElements() {
    return this.currentHeadSnapshot.provisionalElements;
  }
  get newHeadProvisionalElements() {
    return this.newHeadSnapshot.provisionalElements;
  }
  get newBodyScriptElements() {
    return this.newElement.querySelectorAll("script");
  }
};
var MorphingPageRenderer = class extends PageRenderer {
  static renderElement(currentElement, newElement) {
    morphElements(currentElement, newElement, {
      callbacks: {
        beforeNodeMorphed: (element) => !canRefreshFrame(element)
      }
    });
    for (const frame of currentElement.querySelectorAll("turbo-frame")) {
      if (canRefreshFrame(frame)) frame.reload();
    }
    dispatch("turbo:morph", { detail: { currentElement, newElement } });
  }
  async preservingPermanentElements(callback) {
    return await callback();
  }
  get renderMethod() {
    return "morph";
  }
  get shouldAutofocus() {
    return false;
  }
};
function canRefreshFrame(frame) {
  return frame instanceof FrameElement && frame.src && frame.refresh === "morph" && !frame.closest("[data-turbo-permanent]");
}
var SnapshotCache = class {
  keys = [];
  snapshots = {};
  constructor(size) {
    this.size = size;
  }
  has(location2) {
    return toCacheKey(location2) in this.snapshots;
  }
  get(location2) {
    if (this.has(location2)) {
      const snapshot = this.read(location2);
      this.touch(location2);
      return snapshot;
    }
  }
  put(location2, snapshot) {
    this.write(location2, snapshot);
    this.touch(location2);
    return snapshot;
  }
  clear() {
    this.snapshots = {};
  }
  // Private
  read(location2) {
    return this.snapshots[toCacheKey(location2)];
  }
  write(location2, snapshot) {
    this.snapshots[toCacheKey(location2)] = snapshot;
  }
  touch(location2) {
    const key = toCacheKey(location2);
    const index = this.keys.indexOf(key);
    if (index > -1) this.keys.splice(index, 1);
    this.keys.unshift(key);
    this.trim();
  }
  trim() {
    for (const key of this.keys.splice(this.size)) {
      delete this.snapshots[key];
    }
  }
};
var PageView = class extends View {
  snapshotCache = new SnapshotCache(10);
  lastRenderedLocation = new URL(location.href);
  forceReloaded = false;
  shouldTransitionTo(newSnapshot) {
    return this.snapshot.prefersViewTransitions && newSnapshot.prefersViewTransitions;
  }
  renderPage(snapshot, isPreview = false, willRender = true, visit2) {
    const shouldMorphPage = this.isPageRefresh(visit2) && this.snapshot.shouldMorphPage;
    const rendererClass = shouldMorphPage ? MorphingPageRenderer : PageRenderer;
    const renderer = new rendererClass(this.snapshot, snapshot, isPreview, willRender);
    if (!renderer.shouldRender) {
      this.forceReloaded = true;
    } else {
      visit2?.changeHistory();
    }
    return this.render(renderer);
  }
  renderError(snapshot, visit2) {
    visit2?.changeHistory();
    const renderer = new ErrorRenderer(this.snapshot, snapshot, false);
    return this.render(renderer);
  }
  clearSnapshotCache() {
    this.snapshotCache.clear();
  }
  async cacheSnapshot(snapshot = this.snapshot) {
    if (snapshot.isCacheable) {
      this.delegate.viewWillCacheSnapshot();
      const { lastRenderedLocation: location2 } = this;
      await nextEventLoopTick();
      const cachedSnapshot = snapshot.clone();
      this.snapshotCache.put(location2, cachedSnapshot);
      return cachedSnapshot;
    }
  }
  getCachedSnapshotForLocation(location2) {
    return this.snapshotCache.get(location2);
  }
  isPageRefresh(visit2) {
    return !visit2 || this.lastRenderedLocation.pathname === visit2.location.pathname && visit2.action === "replace";
  }
  shouldPreserveScrollPosition(visit2) {
    return this.isPageRefresh(visit2) && this.snapshot.shouldPreserveScrollPosition;
  }
  get snapshot() {
    return PageSnapshot.fromElement(this.element);
  }
};
var Preloader = class {
  selector = "a[data-turbo-preload]";
  constructor(delegate, snapshotCache) {
    this.delegate = delegate;
    this.snapshotCache = snapshotCache;
  }
  start() {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", this.#preloadAll);
    } else {
      this.preloadOnLoadLinksForView(document.body);
    }
  }
  stop() {
    document.removeEventListener("DOMContentLoaded", this.#preloadAll);
  }
  preloadOnLoadLinksForView(element) {
    for (const link of element.querySelectorAll(this.selector)) {
      if (this.delegate.shouldPreloadLink(link)) {
        this.preloadURL(link);
      }
    }
  }
  async preloadURL(link) {
    const location2 = new URL(link.href);
    if (this.snapshotCache.has(location2)) {
      return;
    }
    const fetchRequest = new FetchRequest(this, FetchMethod.get, location2, new URLSearchParams(), link);
    await fetchRequest.perform();
  }
  // Fetch request delegate
  prepareRequest(fetchRequest) {
    fetchRequest.headers["X-Sec-Purpose"] = "prefetch";
  }
  async requestSucceededWithResponse(fetchRequest, fetchResponse) {
    try {
      const responseHTML = await fetchResponse.responseHTML;
      const snapshot = PageSnapshot.fromHTMLString(responseHTML);
      this.snapshotCache.put(fetchRequest.url, snapshot);
    } catch (_2) {
    }
  }
  requestStarted(fetchRequest) {
  }
  requestErrored(fetchRequest) {
  }
  requestFinished(fetchRequest) {
  }
  requestPreventedHandlingResponse(fetchRequest, fetchResponse) {
  }
  requestFailedWithResponse(fetchRequest, fetchResponse) {
  }
  #preloadAll = () => {
    this.preloadOnLoadLinksForView(document.body);
  };
};
var Cache = class {
  constructor(session2) {
    this.session = session2;
  }
  clear() {
    this.session.clearCache();
  }
  resetCacheControl() {
    this.#setCacheControl("");
  }
  exemptPageFromCache() {
    this.#setCacheControl("no-cache");
  }
  exemptPageFromPreview() {
    this.#setCacheControl("no-preview");
  }
  #setCacheControl(value) {
    setMetaContent("turbo-cache-control", value);
  }
};
var Session = class {
  navigator = new Navigator(this);
  history = new History(this);
  view = new PageView(this, document.documentElement);
  adapter = new BrowserAdapter(this);
  pageObserver = new PageObserver(this);
  cacheObserver = new CacheObserver();
  linkPrefetchObserver = new LinkPrefetchObserver(this, document);
  linkClickObserver = new LinkClickObserver(this, window);
  formSubmitObserver = new FormSubmitObserver(this, document);
  scrollObserver = new ScrollObserver(this);
  streamObserver = new StreamObserver(this);
  formLinkClickObserver = new FormLinkClickObserver(this, document.documentElement);
  frameRedirector = new FrameRedirector(this, document.documentElement);
  streamMessageRenderer = new StreamMessageRenderer();
  cache = new Cache(this);
  enabled = true;
  started = false;
  #pageRefreshDebouncePeriod = 150;
  constructor(recentRequests2) {
    this.recentRequests = recentRequests2;
    this.preloader = new Preloader(this, this.view.snapshotCache);
    this.debouncedRefresh = this.refresh;
    this.pageRefreshDebouncePeriod = this.pageRefreshDebouncePeriod;
  }
  start() {
    if (!this.started) {
      this.pageObserver.start();
      this.cacheObserver.start();
      this.linkPrefetchObserver.start();
      this.formLinkClickObserver.start();
      this.linkClickObserver.start();
      this.formSubmitObserver.start();
      this.scrollObserver.start();
      this.streamObserver.start();
      this.frameRedirector.start();
      this.history.start();
      this.preloader.start();
      this.started = true;
      this.enabled = true;
    }
  }
  disable() {
    this.enabled = false;
  }
  stop() {
    if (this.started) {
      this.pageObserver.stop();
      this.cacheObserver.stop();
      this.linkPrefetchObserver.stop();
      this.formLinkClickObserver.stop();
      this.linkClickObserver.stop();
      this.formSubmitObserver.stop();
      this.scrollObserver.stop();
      this.streamObserver.stop();
      this.frameRedirector.stop();
      this.history.stop();
      this.preloader.stop();
      this.started = false;
    }
  }
  registerAdapter(adapter) {
    this.adapter = adapter;
  }
  visit(location2, options = {}) {
    const frameElement = options.frame ? document.getElementById(options.frame) : null;
    if (frameElement instanceof FrameElement) {
      const action = options.action || getVisitAction(frameElement);
      frameElement.delegate.proposeVisitIfNavigatedWithAction(frameElement, action);
      frameElement.src = location2.toString();
    } else {
      this.navigator.proposeVisit(expandURL(location2), options);
    }
  }
  refresh(url, requestId) {
    const isRecentRequest = requestId && this.recentRequests.has(requestId);
    const isCurrentUrl = url === document.baseURI;
    if (!isRecentRequest && !this.navigator.currentVisit && isCurrentUrl) {
      this.visit(url, { action: "replace", shouldCacheSnapshot: false });
    }
  }
  connectStreamSource(source) {
    this.streamObserver.connectStreamSource(source);
  }
  disconnectStreamSource(source) {
    this.streamObserver.disconnectStreamSource(source);
  }
  renderStreamMessage(message) {
    this.streamMessageRenderer.render(StreamMessage.wrap(message));
  }
  clearCache() {
    this.view.clearSnapshotCache();
  }
  setProgressBarDelay(delay) {
    console.warn(
      "Please replace `session.setProgressBarDelay(delay)` with `session.progressBarDelay = delay`. The function is deprecated and will be removed in a future version of Turbo.`"
    );
    this.progressBarDelay = delay;
  }
  set progressBarDelay(delay) {
    config.drive.progressBarDelay = delay;
  }
  get progressBarDelay() {
    return config.drive.progressBarDelay;
  }
  set drive(value) {
    config.drive.enabled = value;
  }
  get drive() {
    return config.drive.enabled;
  }
  set formMode(value) {
    config.forms.mode = value;
  }
  get formMode() {
    return config.forms.mode;
  }
  get location() {
    return this.history.location;
  }
  get restorationIdentifier() {
    return this.history.restorationIdentifier;
  }
  get pageRefreshDebouncePeriod() {
    return this.#pageRefreshDebouncePeriod;
  }
  set pageRefreshDebouncePeriod(value) {
    this.refresh = debounce(this.debouncedRefresh.bind(this), value);
    this.#pageRefreshDebouncePeriod = value;
  }
  // Preloader delegate
  shouldPreloadLink(element) {
    const isUnsafe = element.hasAttribute("data-turbo-method");
    const isStream = element.hasAttribute("data-turbo-stream");
    const frameTarget = element.getAttribute("data-turbo-frame");
    const frame = frameTarget == "_top" ? null : document.getElementById(frameTarget) || findClosestRecursively(element, "turbo-frame:not([disabled])");
    if (isUnsafe || isStream || frame instanceof FrameElement) {
      return false;
    } else {
      const location2 = new URL(element.href);
      return this.elementIsNavigatable(element) && locationIsVisitable(location2, this.snapshot.rootLocation);
    }
  }
  // History delegate
  historyPoppedToLocationWithRestorationIdentifierAndDirection(location2, restorationIdentifier, direction) {
    if (this.enabled) {
      this.navigator.startVisit(location2, restorationIdentifier, {
        action: "restore",
        historyChanged: true,
        direction
      });
    } else {
      this.adapter.pageInvalidated({
        reason: "turbo_disabled"
      });
    }
  }
  // Scroll observer delegate
  scrollPositionChanged(position) {
    this.history.updateRestorationData({ scrollPosition: position });
  }
  // Form click observer delegate
  willSubmitFormLinkToLocation(link, location2) {
    return this.elementIsNavigatable(link) && locationIsVisitable(location2, this.snapshot.rootLocation);
  }
  submittedFormLinkToLocation() {
  }
  // Link hover observer delegate
  canPrefetchRequestToLocation(link, location2) {
    return this.elementIsNavigatable(link) && locationIsVisitable(location2, this.snapshot.rootLocation) && this.navigator.linkPrefetchingIsEnabledForLocation(location2);
  }
  // Link click observer delegate
  willFollowLinkToLocation(link, location2, event) {
    return this.elementIsNavigatable(link) && locationIsVisitable(location2, this.snapshot.rootLocation) && this.applicationAllowsFollowingLinkToLocation(link, location2, event);
  }
  followedLinkToLocation(link, location2) {
    const action = this.getActionForLink(link);
    const acceptsStreamResponse = link.hasAttribute("data-turbo-stream");
    this.visit(location2.href, { action, acceptsStreamResponse });
  }
  // Navigator delegate
  allowsVisitingLocationWithAction(location2, action) {
    return this.locationWithActionIsSamePage(location2, action) || this.applicationAllowsVisitingLocation(location2);
  }
  visitProposedToLocation(location2, options) {
    extendURLWithDeprecatedProperties(location2);
    this.adapter.visitProposedToLocation(location2, options);
  }
  // Visit delegate
  visitStarted(visit2) {
    if (!visit2.acceptsStreamResponse) {
      markAsBusy(document.documentElement);
      this.view.markVisitDirection(visit2.direction);
    }
    extendURLWithDeprecatedProperties(visit2.location);
    if (!visit2.silent) {
      this.notifyApplicationAfterVisitingLocation(visit2.location, visit2.action);
    }
  }
  visitCompleted(visit2) {
    this.view.unmarkVisitDirection();
    clearBusyState(document.documentElement);
    this.notifyApplicationAfterPageLoad(visit2.getTimingMetrics());
  }
  locationWithActionIsSamePage(location2, action) {
    return this.navigator.locationWithActionIsSamePage(location2, action);
  }
  visitScrolledToSamePageLocation(oldURL, newURL) {
    this.notifyApplicationAfterVisitingSamePageLocation(oldURL, newURL);
  }
  // Form submit observer delegate
  willSubmitForm(form, submitter2) {
    const action = getAction$1(form, submitter2);
    return this.submissionIsNavigatable(form, submitter2) && locationIsVisitable(expandURL(action), this.snapshot.rootLocation);
  }
  formSubmitted(form, submitter2) {
    this.navigator.submitForm(form, submitter2);
  }
  // Page observer delegate
  pageBecameInteractive() {
    this.view.lastRenderedLocation = this.location;
    this.notifyApplicationAfterPageLoad();
  }
  pageLoaded() {
    this.history.assumeControlOfScrollRestoration();
  }
  pageWillUnload() {
    this.history.relinquishControlOfScrollRestoration();
  }
  // Stream observer delegate
  receivedMessageFromStream(message) {
    this.renderStreamMessage(message);
  }
  // Page view delegate
  viewWillCacheSnapshot() {
    if (!this.navigator.currentVisit?.silent) {
      this.notifyApplicationBeforeCachingSnapshot();
    }
  }
  allowsImmediateRender({ element }, options) {
    const event = this.notifyApplicationBeforeRender(element, options);
    const {
      defaultPrevented,
      detail: { render }
    } = event;
    if (this.view.renderer && render) {
      this.view.renderer.renderElement = render;
    }
    return !defaultPrevented;
  }
  viewRenderedSnapshot(_snapshot, _isPreview, renderMethod) {
    this.view.lastRenderedLocation = this.history.location;
    this.notifyApplicationAfterRender(renderMethod);
  }
  preloadOnLoadLinksForView(element) {
    this.preloader.preloadOnLoadLinksForView(element);
  }
  viewInvalidated(reason) {
    this.adapter.pageInvalidated(reason);
  }
  // Frame element
  frameLoaded(frame) {
    this.notifyApplicationAfterFrameLoad(frame);
  }
  frameRendered(fetchResponse, frame) {
    this.notifyApplicationAfterFrameRender(fetchResponse, frame);
  }
  // Application events
  applicationAllowsFollowingLinkToLocation(link, location2, ev) {
    const event = this.notifyApplicationAfterClickingLinkToLocation(link, location2, ev);
    return !event.defaultPrevented;
  }
  applicationAllowsVisitingLocation(location2) {
    const event = this.notifyApplicationBeforeVisitingLocation(location2);
    return !event.defaultPrevented;
  }
  notifyApplicationAfterClickingLinkToLocation(link, location2, event) {
    return dispatch("turbo:click", {
      target: link,
      detail: { url: location2.href, originalEvent: event },
      cancelable: true
    });
  }
  notifyApplicationBeforeVisitingLocation(location2) {
    return dispatch("turbo:before-visit", {
      detail: { url: location2.href },
      cancelable: true
    });
  }
  notifyApplicationAfterVisitingLocation(location2, action) {
    return dispatch("turbo:visit", { detail: { url: location2.href, action } });
  }
  notifyApplicationBeforeCachingSnapshot() {
    return dispatch("turbo:before-cache");
  }
  notifyApplicationBeforeRender(newBody, options) {
    return dispatch("turbo:before-render", {
      detail: { newBody, ...options },
      cancelable: true
    });
  }
  notifyApplicationAfterRender(renderMethod) {
    return dispatch("turbo:render", { detail: { renderMethod } });
  }
  notifyApplicationAfterPageLoad(timing = {}) {
    return dispatch("turbo:load", {
      detail: { url: this.location.href, timing }
    });
  }
  notifyApplicationAfterVisitingSamePageLocation(oldURL, newURL) {
    dispatchEvent(
      new HashChangeEvent("hashchange", {
        oldURL: oldURL.toString(),
        newURL: newURL.toString()
      })
    );
  }
  notifyApplicationAfterFrameLoad(frame) {
    return dispatch("turbo:frame-load", { target: frame });
  }
  notifyApplicationAfterFrameRender(fetchResponse, frame) {
    return dispatch("turbo:frame-render", {
      detail: { fetchResponse },
      target: frame,
      cancelable: true
    });
  }
  // Helpers
  submissionIsNavigatable(form, submitter2) {
    if (config.forms.mode == "off") {
      return false;
    } else {
      const submitterIsNavigatable = submitter2 ? this.elementIsNavigatable(submitter2) : true;
      if (config.forms.mode == "optin") {
        return submitterIsNavigatable && form.closest('[data-turbo="true"]') != null;
      } else {
        return submitterIsNavigatable && this.elementIsNavigatable(form);
      }
    }
  }
  elementIsNavigatable(element) {
    const container = findClosestRecursively(element, "[data-turbo]");
    const withinFrame = findClosestRecursively(element, "turbo-frame");
    if (config.drive.enabled || withinFrame) {
      if (container) {
        return container.getAttribute("data-turbo") != "false";
      } else {
        return true;
      }
    } else {
      if (container) {
        return container.getAttribute("data-turbo") == "true";
      } else {
        return false;
      }
    }
  }
  // Private
  getActionForLink(link) {
    return getVisitAction(link) || "advance";
  }
  get snapshot() {
    return this.view.snapshot;
  }
};
function extendURLWithDeprecatedProperties(url) {
  Object.defineProperties(url, deprecatedLocationPropertyDescriptors);
}
var deprecatedLocationPropertyDescriptors = {
  absoluteURL: {
    get() {
      return this.toString();
    }
  }
};
var session = new Session(recentRequests);
var { cache, navigator: navigator$1 } = session;
function start() {
  session.start();
}
function registerAdapter(adapter) {
  session.registerAdapter(adapter);
}
function visit(location2, options) {
  session.visit(location2, options);
}
function connectStreamSource(source) {
  session.connectStreamSource(source);
}
function disconnectStreamSource(source) {
  session.disconnectStreamSource(source);
}
function renderStreamMessage(message) {
  session.renderStreamMessage(message);
}
function clearCache() {
  console.warn(
    "Please replace `Turbo.clearCache()` with `Turbo.cache.clear()`. The top-level function is deprecated and will be removed in a future version of Turbo.`"
  );
  session.clearCache();
}
function setProgressBarDelay(delay) {
  console.warn(
    "Please replace `Turbo.setProgressBarDelay(delay)` with `Turbo.config.drive.progressBarDelay = delay`. The top-level function is deprecated and will be removed in a future version of Turbo.`"
  );
  config.drive.progressBarDelay = delay;
}
function setConfirmMethod(confirmMethod) {
  console.warn(
    "Please replace `Turbo.setConfirmMethod(confirmMethod)` with `Turbo.config.forms.confirm = confirmMethod`. The top-level function is deprecated and will be removed in a future version of Turbo.`"
  );
  config.forms.confirm = confirmMethod;
}
function setFormMode(mode) {
  console.warn(
    "Please replace `Turbo.setFormMode(mode)` with `Turbo.config.forms.mode = mode`. The top-level function is deprecated and will be removed in a future version of Turbo.`"
  );
  config.forms.mode = mode;
}
var Turbo = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  navigator: navigator$1,
  session,
  cache,
  PageRenderer,
  PageSnapshot,
  FrameRenderer,
  fetch: fetchWithTurboHeaders,
  config,
  start,
  registerAdapter,
  visit,
  connectStreamSource,
  disconnectStreamSource,
  renderStreamMessage,
  clearCache,
  setProgressBarDelay,
  setConfirmMethod,
  setFormMode
});
var TurboFrameMissingError = class extends Error {
};
var FrameController = class {
  fetchResponseLoaded = (_fetchResponse) => Promise.resolve();
  #currentFetchRequest = null;
  #resolveVisitPromise = () => {
  };
  #connected = false;
  #hasBeenLoaded = false;
  #ignoredAttributes = /* @__PURE__ */ new Set();
  #shouldMorphFrame = false;
  action = null;
  constructor(element) {
    this.element = element;
    this.view = new FrameView(this, this.element);
    this.appearanceObserver = new AppearanceObserver(this, this.element);
    this.formLinkClickObserver = new FormLinkClickObserver(this, this.element);
    this.linkInterceptor = new LinkInterceptor(this, this.element);
    this.restorationIdentifier = uuid();
    this.formSubmitObserver = new FormSubmitObserver(this, this.element);
  }
  // Frame delegate
  connect() {
    if (!this.#connected) {
      this.#connected = true;
      if (this.loadingStyle == FrameLoadingStyle.lazy) {
        this.appearanceObserver.start();
      } else {
        this.#loadSourceURL();
      }
      this.formLinkClickObserver.start();
      this.linkInterceptor.start();
      this.formSubmitObserver.start();
    }
  }
  disconnect() {
    if (this.#connected) {
      this.#connected = false;
      this.appearanceObserver.stop();
      this.formLinkClickObserver.stop();
      this.linkInterceptor.stop();
      this.formSubmitObserver.stop();
    }
  }
  disabledChanged() {
    if (this.loadingStyle == FrameLoadingStyle.eager) {
      this.#loadSourceURL();
    }
  }
  sourceURLChanged() {
    if (this.#isIgnoringChangesTo("src")) return;
    if (this.element.isConnected) {
      this.complete = false;
    }
    if (this.loadingStyle == FrameLoadingStyle.eager || this.#hasBeenLoaded) {
      this.#loadSourceURL();
    }
  }
  sourceURLReloaded() {
    const { refresh, src } = this.element;
    this.#shouldMorphFrame = src && refresh === "morph";
    this.element.removeAttribute("complete");
    this.element.src = null;
    this.element.src = src;
    return this.element.loaded;
  }
  loadingStyleChanged() {
    if (this.loadingStyle == FrameLoadingStyle.lazy) {
      this.appearanceObserver.start();
    } else {
      this.appearanceObserver.stop();
      this.#loadSourceURL();
    }
  }
  async #loadSourceURL() {
    if (this.enabled && this.isActive && !this.complete && this.sourceURL) {
      this.element.loaded = this.#visit(expandURL(this.sourceURL));
      this.appearanceObserver.stop();
      await this.element.loaded;
      this.#hasBeenLoaded = true;
    }
  }
  async loadResponse(fetchResponse) {
    if (fetchResponse.redirected || fetchResponse.succeeded && fetchResponse.isHTML) {
      this.sourceURL = fetchResponse.response.url;
    }
    try {
      const html = await fetchResponse.responseHTML;
      if (html) {
        const document2 = parseHTMLDocument(html);
        const pageSnapshot = PageSnapshot.fromDocument(document2);
        if (pageSnapshot.isVisitable) {
          await this.#loadFrameResponse(fetchResponse, document2);
        } else {
          await this.#handleUnvisitableFrameResponse(fetchResponse);
        }
      }
    } finally {
      this.#shouldMorphFrame = false;
      this.fetchResponseLoaded = () => Promise.resolve();
    }
  }
  // Appearance observer delegate
  elementAppearedInViewport(element) {
    this.proposeVisitIfNavigatedWithAction(element, getVisitAction(element));
    this.#loadSourceURL();
  }
  // Form link click observer delegate
  willSubmitFormLinkToLocation(link) {
    return this.#shouldInterceptNavigation(link);
  }
  submittedFormLinkToLocation(link, _location, form) {
    const frame = this.#findFrameElement(link);
    if (frame) form.setAttribute("data-turbo-frame", frame.id);
  }
  // Link interceptor delegate
  shouldInterceptLinkClick(element, _location, _event) {
    return this.#shouldInterceptNavigation(element);
  }
  linkClickIntercepted(element, location2) {
    this.#navigateFrame(element, location2);
  }
  // Form submit observer delegate
  willSubmitForm(element, submitter2) {
    return element.closest("turbo-frame") == this.element && this.#shouldInterceptNavigation(element, submitter2);
  }
  formSubmitted(element, submitter2) {
    if (this.formSubmission) {
      this.formSubmission.stop();
    }
    this.formSubmission = new FormSubmission(this, element, submitter2);
    const { fetchRequest } = this.formSubmission;
    this.prepareRequest(fetchRequest);
    this.formSubmission.start();
  }
  // Fetch request delegate
  prepareRequest(request) {
    request.headers["Turbo-Frame"] = this.id;
    if (this.currentNavigationElement?.hasAttribute("data-turbo-stream")) {
      request.acceptResponseType(StreamMessage.contentType);
    }
  }
  requestStarted(_request) {
    markAsBusy(this.element);
  }
  requestPreventedHandlingResponse(_request, _response) {
    this.#resolveVisitPromise();
  }
  async requestSucceededWithResponse(request, response) {
    await this.loadResponse(response);
    this.#resolveVisitPromise();
  }
  async requestFailedWithResponse(request, response) {
    await this.loadResponse(response);
    this.#resolveVisitPromise();
  }
  requestErrored(request, error2) {
    console.error(error2);
    this.#resolveVisitPromise();
  }
  requestFinished(_request) {
    clearBusyState(this.element);
  }
  // Form submission delegate
  formSubmissionStarted({ formElement }) {
    markAsBusy(formElement, this.#findFrameElement(formElement));
  }
  formSubmissionSucceededWithResponse(formSubmission, response) {
    const frame = this.#findFrameElement(formSubmission.formElement, formSubmission.submitter);
    frame.delegate.proposeVisitIfNavigatedWithAction(frame, getVisitAction(formSubmission.submitter, formSubmission.formElement, frame));
    frame.delegate.loadResponse(response);
    if (!formSubmission.isSafe) {
      session.clearCache();
    }
  }
  formSubmissionFailedWithResponse(formSubmission, fetchResponse) {
    this.element.delegate.loadResponse(fetchResponse);
    session.clearCache();
  }
  formSubmissionErrored(formSubmission, error2) {
    console.error(error2);
  }
  formSubmissionFinished({ formElement }) {
    clearBusyState(formElement, this.#findFrameElement(formElement));
  }
  // View delegate
  allowsImmediateRender({ element: newFrame }, options) {
    const event = dispatch("turbo:before-frame-render", {
      target: this.element,
      detail: { newFrame, ...options },
      cancelable: true
    });
    const {
      defaultPrevented,
      detail: { render }
    } = event;
    if (this.view.renderer && render) {
      this.view.renderer.renderElement = render;
    }
    return !defaultPrevented;
  }
  viewRenderedSnapshot(_snapshot, _isPreview, _renderMethod) {
  }
  preloadOnLoadLinksForView(element) {
    session.preloadOnLoadLinksForView(element);
  }
  viewInvalidated() {
  }
  // Frame renderer delegate
  willRenderFrame(currentElement, _newElement) {
    this.previousFrameElement = currentElement.cloneNode(true);
  }
  visitCachedSnapshot = ({ element }) => {
    const frame = element.querySelector("#" + this.element.id);
    if (frame && this.previousFrameElement) {
      frame.replaceChildren(...this.previousFrameElement.children);
    }
    delete this.previousFrameElement;
  };
  // Private
  async #loadFrameResponse(fetchResponse, document2) {
    const newFrameElement = await this.extractForeignFrameElement(document2.body);
    const rendererClass = this.#shouldMorphFrame ? MorphingFrameRenderer : FrameRenderer;
    if (newFrameElement) {
      const snapshot = new Snapshot(newFrameElement);
      const renderer = new rendererClass(this, this.view.snapshot, snapshot, false, false);
      if (this.view.renderPromise) await this.view.renderPromise;
      this.changeHistory();
      await this.view.render(renderer);
      this.complete = true;
      session.frameRendered(fetchResponse, this.element);
      session.frameLoaded(this.element);
      await this.fetchResponseLoaded(fetchResponse);
    } else if (this.#willHandleFrameMissingFromResponse(fetchResponse)) {
      this.#handleFrameMissingFromResponse(fetchResponse);
    }
  }
  async #visit(url) {
    const request = new FetchRequest(this, FetchMethod.get, url, new URLSearchParams(), this.element);
    this.#currentFetchRequest?.cancel();
    this.#currentFetchRequest = request;
    return new Promise((resolve) => {
      this.#resolveVisitPromise = () => {
        this.#resolveVisitPromise = () => {
        };
        this.#currentFetchRequest = null;
        resolve();
      };
      request.perform();
    });
  }
  #navigateFrame(element, url, submitter2) {
    const frame = this.#findFrameElement(element, submitter2);
    frame.delegate.proposeVisitIfNavigatedWithAction(frame, getVisitAction(submitter2, element, frame));
    this.#withCurrentNavigationElement(element, () => {
      frame.src = url;
    });
  }
  proposeVisitIfNavigatedWithAction(frame, action = null) {
    this.action = action;
    if (this.action) {
      const pageSnapshot = PageSnapshot.fromElement(frame).clone();
      const { visitCachedSnapshot } = frame.delegate;
      frame.delegate.fetchResponseLoaded = async (fetchResponse) => {
        if (frame.src) {
          const { statusCode, redirected } = fetchResponse;
          const responseHTML = await fetchResponse.responseHTML;
          const response = { statusCode, redirected, responseHTML };
          const options = {
            response,
            visitCachedSnapshot,
            willRender: false,
            updateHistory: false,
            restorationIdentifier: this.restorationIdentifier,
            snapshot: pageSnapshot
          };
          if (this.action) options.action = this.action;
          session.visit(frame.src, options);
        }
      };
    }
  }
  changeHistory() {
    if (this.action) {
      const method = getHistoryMethodForAction(this.action);
      session.history.update(method, expandURL(this.element.src || ""), this.restorationIdentifier);
    }
  }
  async #handleUnvisitableFrameResponse(fetchResponse) {
    console.warn(
      `The response (${fetchResponse.statusCode}) from <turbo-frame id="${this.element.id}"> is performing a full page visit due to turbo-visit-control.`
    );
    await this.#visitResponse(fetchResponse.response);
  }
  #willHandleFrameMissingFromResponse(fetchResponse) {
    this.element.setAttribute("complete", "");
    const response = fetchResponse.response;
    const visit2 = async (url, options) => {
      if (url instanceof Response) {
        this.#visitResponse(url);
      } else {
        session.visit(url, options);
      }
    };
    const event = dispatch("turbo:frame-missing", {
      target: this.element,
      detail: { response, visit: visit2 },
      cancelable: true
    });
    return !event.defaultPrevented;
  }
  #handleFrameMissingFromResponse(fetchResponse) {
    this.view.missing();
    this.#throwFrameMissingError(fetchResponse);
  }
  #throwFrameMissingError(fetchResponse) {
    const message = `The response (${fetchResponse.statusCode}) did not contain the expected <turbo-frame id="${this.element.id}"> and will be ignored. To perform a full page visit instead, set turbo-visit-control to reload.`;
    throw new TurboFrameMissingError(message);
  }
  async #visitResponse(response) {
    const wrapped = new FetchResponse(response);
    const responseHTML = await wrapped.responseHTML;
    const { location: location2, redirected, statusCode } = wrapped;
    return session.visit(location2, { response: { redirected, statusCode, responseHTML } });
  }
  #findFrameElement(element, submitter2) {
    const id2 = getAttribute("data-turbo-frame", submitter2, element) || this.element.getAttribute("target");
    return getFrameElementById(id2) ?? this.element;
  }
  async extractForeignFrameElement(container) {
    let element;
    const id2 = CSS.escape(this.id);
    try {
      element = activateElement(container.querySelector(`turbo-frame#${id2}`), this.sourceURL);
      if (element) {
        return element;
      }
      element = activateElement(container.querySelector(`turbo-frame[src][recurse~=${id2}]`), this.sourceURL);
      if (element) {
        await element.loaded;
        return await this.extractForeignFrameElement(element);
      }
    } catch (error2) {
      console.error(error2);
      return new FrameElement();
    }
    return null;
  }
  #formActionIsVisitable(form, submitter2) {
    const action = getAction$1(form, submitter2);
    return locationIsVisitable(expandURL(action), this.rootLocation);
  }
  #shouldInterceptNavigation(element, submitter2) {
    const id2 = getAttribute("data-turbo-frame", submitter2, element) || this.element.getAttribute("target");
    if (element instanceof HTMLFormElement && !this.#formActionIsVisitable(element, submitter2)) {
      return false;
    }
    if (!this.enabled || id2 == "_top") {
      return false;
    }
    if (id2) {
      const frameElement = getFrameElementById(id2);
      if (frameElement) {
        return !frameElement.disabled;
      }
    }
    if (!session.elementIsNavigatable(element)) {
      return false;
    }
    if (submitter2 && !session.elementIsNavigatable(submitter2)) {
      return false;
    }
    return true;
  }
  // Computed properties
  get id() {
    return this.element.id;
  }
  get enabled() {
    return !this.element.disabled;
  }
  get sourceURL() {
    if (this.element.src) {
      return this.element.src;
    }
  }
  set sourceURL(sourceURL) {
    this.#ignoringChangesToAttribute("src", () => {
      this.element.src = sourceURL ?? null;
    });
  }
  get loadingStyle() {
    return this.element.loading;
  }
  get isLoading() {
    return this.formSubmission !== void 0 || this.#resolveVisitPromise() !== void 0;
  }
  get complete() {
    return this.element.hasAttribute("complete");
  }
  set complete(value) {
    if (value) {
      this.element.setAttribute("complete", "");
    } else {
      this.element.removeAttribute("complete");
    }
  }
  get isActive() {
    return this.element.isActive && this.#connected;
  }
  get rootLocation() {
    const meta = this.element.ownerDocument.querySelector(`meta[name="turbo-root"]`);
    const root = meta?.content ?? "/";
    return expandURL(root);
  }
  #isIgnoringChangesTo(attributeName) {
    return this.#ignoredAttributes.has(attributeName);
  }
  #ignoringChangesToAttribute(attributeName, callback) {
    this.#ignoredAttributes.add(attributeName);
    callback();
    this.#ignoredAttributes.delete(attributeName);
  }
  #withCurrentNavigationElement(element, callback) {
    this.currentNavigationElement = element;
    callback();
    delete this.currentNavigationElement;
  }
};
function getFrameElementById(id2) {
  if (id2 != null) {
    const element = document.getElementById(id2);
    if (element instanceof FrameElement) {
      return element;
    }
  }
}
function activateElement(element, currentURL) {
  if (element) {
    const src = element.getAttribute("src");
    if (src != null && currentURL != null && urlsAreEqual(src, currentURL)) {
      throw new Error(`Matching <turbo-frame id="${element.id}"> element has a source URL which references itself`);
    }
    if (element.ownerDocument !== document) {
      element = document.importNode(element, true);
    }
    if (element instanceof FrameElement) {
      element.connectedCallback();
      element.disconnectedCallback();
      return element;
    }
  }
}
var StreamActions = {
  after() {
    this.targetElements.forEach((e2) => e2.parentElement?.insertBefore(this.templateContent, e2.nextSibling));
  },
  append() {
    this.removeDuplicateTargetChildren();
    this.targetElements.forEach((e2) => e2.append(this.templateContent));
  },
  before() {
    this.targetElements.forEach((e2) => e2.parentElement?.insertBefore(this.templateContent, e2));
  },
  prepend() {
    this.removeDuplicateTargetChildren();
    this.targetElements.forEach((e2) => e2.prepend(this.templateContent));
  },
  remove() {
    this.targetElements.forEach((e2) => e2.remove());
  },
  replace() {
    const method = this.getAttribute("method");
    this.targetElements.forEach((targetElement) => {
      if (method === "morph") {
        morphElements(targetElement, this.templateContent);
      } else {
        targetElement.replaceWith(this.templateContent);
      }
    });
  },
  update() {
    const method = this.getAttribute("method");
    this.targetElements.forEach((targetElement) => {
      if (method === "morph") {
        morphChildren(targetElement, this.templateContent);
      } else {
        targetElement.innerHTML = "";
        targetElement.append(this.templateContent);
      }
    });
  },
  refresh() {
    session.refresh(this.baseURI, this.requestId);
  }
};
var StreamElement = class _StreamElement extends HTMLElement {
  static async renderElement(newElement) {
    await newElement.performAction();
  }
  async connectedCallback() {
    try {
      await this.render();
    } catch (error2) {
      console.error(error2);
    } finally {
      this.disconnect();
    }
  }
  async render() {
    return this.renderPromise ??= (async () => {
      const event = this.beforeRenderEvent;
      if (this.dispatchEvent(event)) {
        await nextRepaint();
        await event.detail.render(this);
      }
    })();
  }
  disconnect() {
    try {
      this.remove();
    } catch {
    }
  }
  /**
   * Removes duplicate children (by ID)
   */
  removeDuplicateTargetChildren() {
    this.duplicateChildren.forEach((c2) => c2.remove());
  }
  /**
   * Gets the list of duplicate children (i.e. those with the same ID)
   */
  get duplicateChildren() {
    const existingChildren = this.targetElements.flatMap((e2) => [...e2.children]).filter((c2) => !!c2.getAttribute("id"));
    const newChildrenIds = [...this.templateContent?.children || []].filter((c2) => !!c2.getAttribute("id")).map((c2) => c2.getAttribute("id"));
    return existingChildren.filter((c2) => newChildrenIds.includes(c2.getAttribute("id")));
  }
  /**
   * Gets the action function to be performed.
   */
  get performAction() {
    if (this.action) {
      const actionFunction = StreamActions[this.action];
      if (actionFunction) {
        return actionFunction;
      }
      this.#raise("unknown action");
    }
    this.#raise("action attribute is missing");
  }
  /**
   * Gets the target elements which the template will be rendered to.
   */
  get targetElements() {
    if (this.target) {
      return this.targetElementsById;
    } else if (this.targets) {
      return this.targetElementsByQuery;
    } else {
      this.#raise("target or targets attribute is missing");
    }
  }
  /**
   * Gets the contents of the main `<template>`.
   */
  get templateContent() {
    return this.templateElement.content.cloneNode(true);
  }
  /**
   * Gets the main `<template>` used for rendering
   */
  get templateElement() {
    if (this.firstElementChild === null) {
      const template = this.ownerDocument.createElement("template");
      this.appendChild(template);
      return template;
    } else if (this.firstElementChild instanceof HTMLTemplateElement) {
      return this.firstElementChild;
    }
    this.#raise("first child element must be a <template> element");
  }
  /**
   * Gets the current action.
   */
  get action() {
    return this.getAttribute("action");
  }
  /**
   * Gets the current target (an element ID) to which the result will
   * be rendered.
   */
  get target() {
    return this.getAttribute("target");
  }
  /**
   * Gets the current "targets" selector (a CSS selector)
   */
  get targets() {
    return this.getAttribute("targets");
  }
  /**
   * Reads the request-id attribute
   */
  get requestId() {
    return this.getAttribute("request-id");
  }
  #raise(message) {
    throw new Error(`${this.description}: ${message}`);
  }
  get description() {
    return (this.outerHTML.match(/<[^>]+>/) ?? [])[0] ?? "<turbo-stream>";
  }
  get beforeRenderEvent() {
    return new CustomEvent("turbo:before-stream-render", {
      bubbles: true,
      cancelable: true,
      detail: { newStream: this, render: _StreamElement.renderElement }
    });
  }
  get targetElementsById() {
    const element = this.ownerDocument?.getElementById(this.target);
    if (element !== null) {
      return [element];
    } else {
      return [];
    }
  }
  get targetElementsByQuery() {
    const elements = this.ownerDocument?.querySelectorAll(this.targets);
    if (elements.length !== 0) {
      return Array.prototype.slice.call(elements);
    } else {
      return [];
    }
  }
};
var StreamSourceElement = class extends HTMLElement {
  streamSource = null;
  connectedCallback() {
    this.streamSource = this.src.match(/^ws{1,2}:/) ? new WebSocket(this.src) : new EventSource(this.src);
    connectStreamSource(this.streamSource);
  }
  disconnectedCallback() {
    if (this.streamSource) {
      this.streamSource.close();
      disconnectStreamSource(this.streamSource);
    }
  }
  get src() {
    return this.getAttribute("src") || "";
  }
};
FrameElement.delegateConstructor = FrameController;
if (customElements.get("turbo-frame") === void 0) {
  customElements.define("turbo-frame", FrameElement);
}
if (customElements.get("turbo-stream") === void 0) {
  customElements.define("turbo-stream", StreamElement);
}
if (customElements.get("turbo-stream-source") === void 0) {
  customElements.define("turbo-stream-source", StreamSourceElement);
}
(() => {
  let element = document.currentScript;
  if (!element) return;
  if (element.hasAttribute("data-turbo-suppress-warning")) return;
  element = element.parentElement;
  while (element) {
    if (element == document.body) {
      return console.warn(
        unindent`
        You are loading Turbo from a <script> element inside the <body> element. This is probably not what you meant to do!

        Load your application’s JavaScript bundle inside the <head> element instead. <script> elements in <body> are evaluated with each page change.

        For more information, see: https://turbo.hotwired.dev/handbook/building#working-with-script-elements

        ——
        Suppress this warning by adding a "data-turbo-suppress-warning" attribute to: %s
      `,
        element.outerHTML
      );
    }
    element = element.parentElement;
  }
})();
window.Turbo = { ...Turbo, StreamActions };
start();

// node_modules/@hotwired/turbo-rails/app/javascript/turbo/cable.js
var consumer;
async function getConsumer() {
  return consumer || setConsumer(createConsumer2().then(setConsumer));
}
function setConsumer(newConsumer) {
  return consumer = newConsumer;
}
async function createConsumer2() {
  const { createConsumer: createConsumer3 } = await Promise.resolve().then(() => (init_src(), src_exports));
  return createConsumer3();
}
async function subscribeTo(channel, mixin) {
  const { subscriptions } = await getConsumer();
  return subscriptions.create(channel, mixin);
}

// node_modules/@hotwired/turbo-rails/app/javascript/turbo/snakeize.js
function walk(obj) {
  if (!obj || typeof obj !== "object") return obj;
  if (obj instanceof Date || obj instanceof RegExp) return obj;
  if (Array.isArray(obj)) return obj.map(walk);
  return Object.keys(obj).reduce(function(acc, key) {
    var camel = key[0].toLowerCase() + key.slice(1).replace(/([A-Z]+)/g, function(m2, x2) {
      return "_" + x2.toLowerCase();
    });
    acc[camel] = walk(obj[key]);
    return acc;
  }, {});
}

// node_modules/@hotwired/turbo-rails/app/javascript/turbo/cable_stream_source_element.js
var TurboCableStreamSourceElement = class extends HTMLElement {
  static observedAttributes = ["channel", "signed-stream-name"];
  async connectedCallback() {
    connectStreamSource(this);
    this.subscription = await subscribeTo(this.channel, {
      received: this.dispatchMessageEvent.bind(this),
      connected: this.subscriptionConnected.bind(this),
      disconnected: this.subscriptionDisconnected.bind(this)
    });
  }
  disconnectedCallback() {
    disconnectStreamSource(this);
    if (this.subscription) this.subscription.unsubscribe();
    this.subscriptionDisconnected();
  }
  attributeChangedCallback() {
    if (this.subscription) {
      this.disconnectedCallback();
      this.connectedCallback();
    }
  }
  dispatchMessageEvent(data) {
    const event = new MessageEvent("message", { data });
    return this.dispatchEvent(event);
  }
  subscriptionConnected() {
    this.setAttribute("connected", "");
  }
  subscriptionDisconnected() {
    this.removeAttribute("connected");
  }
  get channel() {
    const channel = this.getAttribute("channel");
    const signed_stream_name = this.getAttribute("signed-stream-name");
    return { channel, signed_stream_name, ...walk({ ...this.dataset }) };
  }
};
if (customElements.get("turbo-cable-stream-source") === void 0) {
  customElements.define("turbo-cable-stream-source", TurboCableStreamSourceElement);
}

// node_modules/@hotwired/turbo-rails/app/javascript/turbo/fetch_requests.js
function encodeMethodIntoRequestBody(event) {
  if (event.target instanceof HTMLFormElement) {
    const { target: form, detail: { fetchOptions } } = event;
    form.addEventListener("turbo:submit-start", ({ detail: { formSubmission: { submitter: submitter2 } } }) => {
      const body = isBodyInit(fetchOptions.body) ? fetchOptions.body : new URLSearchParams();
      const method = determineFetchMethod(submitter2, body, form);
      if (!/get/i.test(method)) {
        if (/post/i.test(method)) {
          body.delete("_method");
        } else {
          body.set("_method", method);
        }
        fetchOptions.method = "post";
      }
    }, { once: true });
  }
}
function determineFetchMethod(submitter2, body, form) {
  const formMethod = determineFormMethod(submitter2);
  const overrideMethod = body.get("_method");
  const method = form.getAttribute("method") || "get";
  if (typeof formMethod == "string") {
    return formMethod;
  } else if (typeof overrideMethod == "string") {
    return overrideMethod;
  } else {
    return method;
  }
}
function determineFormMethod(submitter2) {
  if (submitter2 instanceof HTMLButtonElement || submitter2 instanceof HTMLInputElement) {
    if (submitter2.name === "_method") {
      return submitter2.value;
    } else if (submitter2.hasAttribute("formmethod")) {
      return submitter2.formMethod;
    } else {
      return null;
    }
  } else {
    return null;
  }
}
function isBodyInit(body) {
  return body instanceof FormData || body instanceof URLSearchParams;
}

// node_modules/@hotwired/turbo-rails/app/javascript/turbo/index.js
window.Turbo = turbo_es2017_esm_exports;
addEventListener("turbo:before-fetch-request", encodeMethodIntoRequestBody);

// node_modules/@hotwired/stimulus/dist/stimulus.js
var EventListener = class {
  constructor(eventTarget, eventName, eventOptions) {
    this.eventTarget = eventTarget;
    this.eventName = eventName;
    this.eventOptions = eventOptions;
    this.unorderedBindings = /* @__PURE__ */ new Set();
  }
  connect() {
    this.eventTarget.addEventListener(this.eventName, this, this.eventOptions);
  }
  disconnect() {
    this.eventTarget.removeEventListener(this.eventName, this, this.eventOptions);
  }
  bindingConnected(binding) {
    this.unorderedBindings.add(binding);
  }
  bindingDisconnected(binding) {
    this.unorderedBindings.delete(binding);
  }
  handleEvent(event) {
    const extendedEvent = extendEvent(event);
    for (const binding of this.bindings) {
      if (extendedEvent.immediatePropagationStopped) {
        break;
      } else {
        binding.handleEvent(extendedEvent);
      }
    }
  }
  hasBindings() {
    return this.unorderedBindings.size > 0;
  }
  get bindings() {
    return Array.from(this.unorderedBindings).sort((left2, right2) => {
      const leftIndex = left2.index, rightIndex = right2.index;
      return leftIndex < rightIndex ? -1 : leftIndex > rightIndex ? 1 : 0;
    });
  }
};
function extendEvent(event) {
  if ("immediatePropagationStopped" in event) {
    return event;
  } else {
    const { stopImmediatePropagation } = event;
    return Object.assign(event, {
      immediatePropagationStopped: false,
      stopImmediatePropagation() {
        this.immediatePropagationStopped = true;
        stopImmediatePropagation.call(this);
      }
    });
  }
}
var Dispatcher = class {
  constructor(application2) {
    this.application = application2;
    this.eventListenerMaps = /* @__PURE__ */ new Map();
    this.started = false;
  }
  start() {
    if (!this.started) {
      this.started = true;
      this.eventListeners.forEach((eventListener) => eventListener.connect());
    }
  }
  stop() {
    if (this.started) {
      this.started = false;
      this.eventListeners.forEach((eventListener) => eventListener.disconnect());
    }
  }
  get eventListeners() {
    return Array.from(this.eventListenerMaps.values()).reduce((listeners, map) => listeners.concat(Array.from(map.values())), []);
  }
  bindingConnected(binding) {
    this.fetchEventListenerForBinding(binding).bindingConnected(binding);
  }
  bindingDisconnected(binding, clearEventListeners = false) {
    this.fetchEventListenerForBinding(binding).bindingDisconnected(binding);
    if (clearEventListeners)
      this.clearEventListenersForBinding(binding);
  }
  handleError(error2, message, detail = {}) {
    this.application.handleError(error2, `Error ${message}`, detail);
  }
  clearEventListenersForBinding(binding) {
    const eventListener = this.fetchEventListenerForBinding(binding);
    if (!eventListener.hasBindings()) {
      eventListener.disconnect();
      this.removeMappedEventListenerFor(binding);
    }
  }
  removeMappedEventListenerFor(binding) {
    const { eventTarget, eventName, eventOptions } = binding;
    const eventListenerMap = this.fetchEventListenerMapForEventTarget(eventTarget);
    const cacheKey = this.cacheKey(eventName, eventOptions);
    eventListenerMap.delete(cacheKey);
    if (eventListenerMap.size == 0)
      this.eventListenerMaps.delete(eventTarget);
  }
  fetchEventListenerForBinding(binding) {
    const { eventTarget, eventName, eventOptions } = binding;
    return this.fetchEventListener(eventTarget, eventName, eventOptions);
  }
  fetchEventListener(eventTarget, eventName, eventOptions) {
    const eventListenerMap = this.fetchEventListenerMapForEventTarget(eventTarget);
    const cacheKey = this.cacheKey(eventName, eventOptions);
    let eventListener = eventListenerMap.get(cacheKey);
    if (!eventListener) {
      eventListener = this.createEventListener(eventTarget, eventName, eventOptions);
      eventListenerMap.set(cacheKey, eventListener);
    }
    return eventListener;
  }
  createEventListener(eventTarget, eventName, eventOptions) {
    const eventListener = new EventListener(eventTarget, eventName, eventOptions);
    if (this.started) {
      eventListener.connect();
    }
    return eventListener;
  }
  fetchEventListenerMapForEventTarget(eventTarget) {
    let eventListenerMap = this.eventListenerMaps.get(eventTarget);
    if (!eventListenerMap) {
      eventListenerMap = /* @__PURE__ */ new Map();
      this.eventListenerMaps.set(eventTarget, eventListenerMap);
    }
    return eventListenerMap;
  }
  cacheKey(eventName, eventOptions) {
    const parts = [eventName];
    Object.keys(eventOptions).sort().forEach((key) => {
      parts.push(`${eventOptions[key] ? "" : "!"}${key}`);
    });
    return parts.join(":");
  }
};
var defaultActionDescriptorFilters = {
  stop({ event, value }) {
    if (value)
      event.stopPropagation();
    return true;
  },
  prevent({ event, value }) {
    if (value)
      event.preventDefault();
    return true;
  },
  self({ event, value, element }) {
    if (value) {
      return element === event.target;
    } else {
      return true;
    }
  }
};
var descriptorPattern = /^(?:(?:([^.]+?)\+)?(.+?)(?:\.(.+?))?(?:@(window|document))?->)?(.+?)(?:#([^:]+?))(?::(.+))?$/;
function parseActionDescriptorString(descriptorString) {
  const source = descriptorString.trim();
  const matches = source.match(descriptorPattern) || [];
  let eventName = matches[2];
  let keyFilter = matches[3];
  if (keyFilter && !["keydown", "keyup", "keypress"].includes(eventName)) {
    eventName += `.${keyFilter}`;
    keyFilter = "";
  }
  return {
    eventTarget: parseEventTarget(matches[4]),
    eventName,
    eventOptions: matches[7] ? parseEventOptions(matches[7]) : {},
    identifier: matches[5],
    methodName: matches[6],
    keyFilter: matches[1] || keyFilter
  };
}
function parseEventTarget(eventTargetName) {
  if (eventTargetName == "window") {
    return window;
  } else if (eventTargetName == "document") {
    return document;
  }
}
function parseEventOptions(eventOptions) {
  return eventOptions.split(":").reduce((options, token) => Object.assign(options, { [token.replace(/^!/, "")]: !/^!/.test(token) }), {});
}
function stringifyEventTarget(eventTarget) {
  if (eventTarget == window) {
    return "window";
  } else if (eventTarget == document) {
    return "document";
  }
}
function camelize(value) {
  return value.replace(/(?:[_-])([a-z0-9])/g, (_2, char) => char.toUpperCase());
}
function namespaceCamelize(value) {
  return camelize(value.replace(/--/g, "-").replace(/__/g, "_"));
}
function capitalize(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
function dasherize(value) {
  return value.replace(/([A-Z])/g, (_2, char) => `-${char.toLowerCase()}`);
}
function tokenize(value) {
  return value.match(/[^\s]+/g) || [];
}
function isSomething(object) {
  return object !== null && object !== void 0;
}
function hasProperty(object, property) {
  return Object.prototype.hasOwnProperty.call(object, property);
}
var allModifiers = ["meta", "ctrl", "alt", "shift"];
var Action = class {
  constructor(element, index, descriptor, schema) {
    this.element = element;
    this.index = index;
    this.eventTarget = descriptor.eventTarget || element;
    this.eventName = descriptor.eventName || getDefaultEventNameForElement(element) || error("missing event name");
    this.eventOptions = descriptor.eventOptions || {};
    this.identifier = descriptor.identifier || error("missing identifier");
    this.methodName = descriptor.methodName || error("missing method name");
    this.keyFilter = descriptor.keyFilter || "";
    this.schema = schema;
  }
  static forToken(token, schema) {
    return new this(token.element, token.index, parseActionDescriptorString(token.content), schema);
  }
  toString() {
    const eventFilter = this.keyFilter ? `.${this.keyFilter}` : "";
    const eventTarget = this.eventTargetName ? `@${this.eventTargetName}` : "";
    return `${this.eventName}${eventFilter}${eventTarget}->${this.identifier}#${this.methodName}`;
  }
  shouldIgnoreKeyboardEvent(event) {
    if (!this.keyFilter) {
      return false;
    }
    const filters = this.keyFilter.split("+");
    if (this.keyFilterDissatisfied(event, filters)) {
      return true;
    }
    const standardFilter = filters.filter((key) => !allModifiers.includes(key))[0];
    if (!standardFilter) {
      return false;
    }
    if (!hasProperty(this.keyMappings, standardFilter)) {
      error(`contains unknown key filter: ${this.keyFilter}`);
    }
    return this.keyMappings[standardFilter].toLowerCase() !== event.key.toLowerCase();
  }
  shouldIgnoreMouseEvent(event) {
    if (!this.keyFilter) {
      return false;
    }
    const filters = [this.keyFilter];
    if (this.keyFilterDissatisfied(event, filters)) {
      return true;
    }
    return false;
  }
  get params() {
    const params = {};
    const pattern = new RegExp(`^data-${this.identifier}-(.+)-param$`, "i");
    for (const { name, value } of Array.from(this.element.attributes)) {
      const match = name.match(pattern);
      const key = match && match[1];
      if (key) {
        params[camelize(key)] = typecast(value);
      }
    }
    return params;
  }
  get eventTargetName() {
    return stringifyEventTarget(this.eventTarget);
  }
  get keyMappings() {
    return this.schema.keyMappings;
  }
  keyFilterDissatisfied(event, filters) {
    const [meta, ctrl, alt, shift] = allModifiers.map((modifier) => filters.includes(modifier));
    return event.metaKey !== meta || event.ctrlKey !== ctrl || event.altKey !== alt || event.shiftKey !== shift;
  }
};
var defaultEventNames = {
  a: () => "click",
  button: () => "click",
  form: () => "submit",
  details: () => "toggle",
  input: (e2) => e2.getAttribute("type") == "submit" ? "click" : "input",
  select: () => "change",
  textarea: () => "input"
};
function getDefaultEventNameForElement(element) {
  const tagName = element.tagName.toLowerCase();
  if (tagName in defaultEventNames) {
    return defaultEventNames[tagName](element);
  }
}
function error(message) {
  throw new Error(message);
}
function typecast(value) {
  try {
    return JSON.parse(value);
  } catch (o_O) {
    return value;
  }
}
var Binding = class {
  constructor(context, action) {
    this.context = context;
    this.action = action;
  }
  get index() {
    return this.action.index;
  }
  get eventTarget() {
    return this.action.eventTarget;
  }
  get eventOptions() {
    return this.action.eventOptions;
  }
  get identifier() {
    return this.context.identifier;
  }
  handleEvent(event) {
    const actionEvent = this.prepareActionEvent(event);
    if (this.willBeInvokedByEvent(event) && this.applyEventModifiers(actionEvent)) {
      this.invokeWithEvent(actionEvent);
    }
  }
  get eventName() {
    return this.action.eventName;
  }
  get method() {
    const method = this.controller[this.methodName];
    if (typeof method == "function") {
      return method;
    }
    throw new Error(`Action "${this.action}" references undefined method "${this.methodName}"`);
  }
  applyEventModifiers(event) {
    const { element } = this.action;
    const { actionDescriptorFilters } = this.context.application;
    const { controller } = this.context;
    let passes = true;
    for (const [name, value] of Object.entries(this.eventOptions)) {
      if (name in actionDescriptorFilters) {
        const filter = actionDescriptorFilters[name];
        passes = passes && filter({ name, value, event, element, controller });
      } else {
        continue;
      }
    }
    return passes;
  }
  prepareActionEvent(event) {
    return Object.assign(event, { params: this.action.params });
  }
  invokeWithEvent(event) {
    const { target, currentTarget } = event;
    try {
      this.method.call(this.controller, event);
      this.context.logDebugActivity(this.methodName, { event, target, currentTarget, action: this.methodName });
    } catch (error2) {
      const { identifier, controller, element, index } = this;
      const detail = { identifier, controller, element, index, event };
      this.context.handleError(error2, `invoking action "${this.action}"`, detail);
    }
  }
  willBeInvokedByEvent(event) {
    const eventTarget = event.target;
    if (event instanceof KeyboardEvent && this.action.shouldIgnoreKeyboardEvent(event)) {
      return false;
    }
    if (event instanceof MouseEvent && this.action.shouldIgnoreMouseEvent(event)) {
      return false;
    }
    if (this.element === eventTarget) {
      return true;
    } else if (eventTarget instanceof Element && this.element.contains(eventTarget)) {
      return this.scope.containsElement(eventTarget);
    } else {
      return this.scope.containsElement(this.action.element);
    }
  }
  get controller() {
    return this.context.controller;
  }
  get methodName() {
    return this.action.methodName;
  }
  get element() {
    return this.scope.element;
  }
  get scope() {
    return this.context.scope;
  }
};
var ElementObserver = class {
  constructor(element, delegate) {
    this.mutationObserverInit = { attributes: true, childList: true, subtree: true };
    this.element = element;
    this.started = false;
    this.delegate = delegate;
    this.elements = /* @__PURE__ */ new Set();
    this.mutationObserver = new MutationObserver((mutations) => this.processMutations(mutations));
  }
  start() {
    if (!this.started) {
      this.started = true;
      this.mutationObserver.observe(this.element, this.mutationObserverInit);
      this.refresh();
    }
  }
  pause(callback) {
    if (this.started) {
      this.mutationObserver.disconnect();
      this.started = false;
    }
    callback();
    if (!this.started) {
      this.mutationObserver.observe(this.element, this.mutationObserverInit);
      this.started = true;
    }
  }
  stop() {
    if (this.started) {
      this.mutationObserver.takeRecords();
      this.mutationObserver.disconnect();
      this.started = false;
    }
  }
  refresh() {
    if (this.started) {
      const matches = new Set(this.matchElementsInTree());
      for (const element of Array.from(this.elements)) {
        if (!matches.has(element)) {
          this.removeElement(element);
        }
      }
      for (const element of Array.from(matches)) {
        this.addElement(element);
      }
    }
  }
  processMutations(mutations) {
    if (this.started) {
      for (const mutation of mutations) {
        this.processMutation(mutation);
      }
    }
  }
  processMutation(mutation) {
    if (mutation.type == "attributes") {
      this.processAttributeChange(mutation.target, mutation.attributeName);
    } else if (mutation.type == "childList") {
      this.processRemovedNodes(mutation.removedNodes);
      this.processAddedNodes(mutation.addedNodes);
    }
  }
  processAttributeChange(element, attributeName) {
    if (this.elements.has(element)) {
      if (this.delegate.elementAttributeChanged && this.matchElement(element)) {
        this.delegate.elementAttributeChanged(element, attributeName);
      } else {
        this.removeElement(element);
      }
    } else if (this.matchElement(element)) {
      this.addElement(element);
    }
  }
  processRemovedNodes(nodes) {
    for (const node of Array.from(nodes)) {
      const element = this.elementFromNode(node);
      if (element) {
        this.processTree(element, this.removeElement);
      }
    }
  }
  processAddedNodes(nodes) {
    for (const node of Array.from(nodes)) {
      const element = this.elementFromNode(node);
      if (element && this.elementIsActive(element)) {
        this.processTree(element, this.addElement);
      }
    }
  }
  matchElement(element) {
    return this.delegate.matchElement(element);
  }
  matchElementsInTree(tree = this.element) {
    return this.delegate.matchElementsInTree(tree);
  }
  processTree(tree, processor) {
    for (const element of this.matchElementsInTree(tree)) {
      processor.call(this, element);
    }
  }
  elementFromNode(node) {
    if (node.nodeType == Node.ELEMENT_NODE) {
      return node;
    }
  }
  elementIsActive(element) {
    if (element.isConnected != this.element.isConnected) {
      return false;
    } else {
      return this.element.contains(element);
    }
  }
  addElement(element) {
    if (!this.elements.has(element)) {
      if (this.elementIsActive(element)) {
        this.elements.add(element);
        if (this.delegate.elementMatched) {
          this.delegate.elementMatched(element);
        }
      }
    }
  }
  removeElement(element) {
    if (this.elements.has(element)) {
      this.elements.delete(element);
      if (this.delegate.elementUnmatched) {
        this.delegate.elementUnmatched(element);
      }
    }
  }
};
var AttributeObserver = class {
  constructor(element, attributeName, delegate) {
    this.attributeName = attributeName;
    this.delegate = delegate;
    this.elementObserver = new ElementObserver(element, this);
  }
  get element() {
    return this.elementObserver.element;
  }
  get selector() {
    return `[${this.attributeName}]`;
  }
  start() {
    this.elementObserver.start();
  }
  pause(callback) {
    this.elementObserver.pause(callback);
  }
  stop() {
    this.elementObserver.stop();
  }
  refresh() {
    this.elementObserver.refresh();
  }
  get started() {
    return this.elementObserver.started;
  }
  matchElement(element) {
    return element.hasAttribute(this.attributeName);
  }
  matchElementsInTree(tree) {
    const match = this.matchElement(tree) ? [tree] : [];
    const matches = Array.from(tree.querySelectorAll(this.selector));
    return match.concat(matches);
  }
  elementMatched(element) {
    if (this.delegate.elementMatchedAttribute) {
      this.delegate.elementMatchedAttribute(element, this.attributeName);
    }
  }
  elementUnmatched(element) {
    if (this.delegate.elementUnmatchedAttribute) {
      this.delegate.elementUnmatchedAttribute(element, this.attributeName);
    }
  }
  elementAttributeChanged(element, attributeName) {
    if (this.delegate.elementAttributeValueChanged && this.attributeName == attributeName) {
      this.delegate.elementAttributeValueChanged(element, attributeName);
    }
  }
};
function add(map, key, value) {
  fetch(map, key).add(value);
}
function del(map, key, value) {
  fetch(map, key).delete(value);
  prune(map, key);
}
function fetch(map, key) {
  let values = map.get(key);
  if (!values) {
    values = /* @__PURE__ */ new Set();
    map.set(key, values);
  }
  return values;
}
function prune(map, key) {
  const values = map.get(key);
  if (values != null && values.size == 0) {
    map.delete(key);
  }
}
var Multimap = class {
  constructor() {
    this.valuesByKey = /* @__PURE__ */ new Map();
  }
  get keys() {
    return Array.from(this.valuesByKey.keys());
  }
  get values() {
    const sets = Array.from(this.valuesByKey.values());
    return sets.reduce((values, set) => values.concat(Array.from(set)), []);
  }
  get size() {
    const sets = Array.from(this.valuesByKey.values());
    return sets.reduce((size, set) => size + set.size, 0);
  }
  add(key, value) {
    add(this.valuesByKey, key, value);
  }
  delete(key, value) {
    del(this.valuesByKey, key, value);
  }
  has(key, value) {
    const values = this.valuesByKey.get(key);
    return values != null && values.has(value);
  }
  hasKey(key) {
    return this.valuesByKey.has(key);
  }
  hasValue(value) {
    const sets = Array.from(this.valuesByKey.values());
    return sets.some((set) => set.has(value));
  }
  getValuesForKey(key) {
    const values = this.valuesByKey.get(key);
    return values ? Array.from(values) : [];
  }
  getKeysForValue(value) {
    return Array.from(this.valuesByKey).filter(([_key, values]) => values.has(value)).map(([key, _values]) => key);
  }
};
var SelectorObserver = class {
  constructor(element, selector, delegate, details) {
    this._selector = selector;
    this.details = details;
    this.elementObserver = new ElementObserver(element, this);
    this.delegate = delegate;
    this.matchesByElement = new Multimap();
  }
  get started() {
    return this.elementObserver.started;
  }
  get selector() {
    return this._selector;
  }
  set selector(selector) {
    this._selector = selector;
    this.refresh();
  }
  start() {
    this.elementObserver.start();
  }
  pause(callback) {
    this.elementObserver.pause(callback);
  }
  stop() {
    this.elementObserver.stop();
  }
  refresh() {
    this.elementObserver.refresh();
  }
  get element() {
    return this.elementObserver.element;
  }
  matchElement(element) {
    const { selector } = this;
    if (selector) {
      const matches = element.matches(selector);
      if (this.delegate.selectorMatchElement) {
        return matches && this.delegate.selectorMatchElement(element, this.details);
      }
      return matches;
    } else {
      return false;
    }
  }
  matchElementsInTree(tree) {
    const { selector } = this;
    if (selector) {
      const match = this.matchElement(tree) ? [tree] : [];
      const matches = Array.from(tree.querySelectorAll(selector)).filter((match2) => this.matchElement(match2));
      return match.concat(matches);
    } else {
      return [];
    }
  }
  elementMatched(element) {
    const { selector } = this;
    if (selector) {
      this.selectorMatched(element, selector);
    }
  }
  elementUnmatched(element) {
    const selectors = this.matchesByElement.getKeysForValue(element);
    for (const selector of selectors) {
      this.selectorUnmatched(element, selector);
    }
  }
  elementAttributeChanged(element, _attributeName) {
    const { selector } = this;
    if (selector) {
      const matches = this.matchElement(element);
      const matchedBefore = this.matchesByElement.has(selector, element);
      if (matches && !matchedBefore) {
        this.selectorMatched(element, selector);
      } else if (!matches && matchedBefore) {
        this.selectorUnmatched(element, selector);
      }
    }
  }
  selectorMatched(element, selector) {
    this.delegate.selectorMatched(element, selector, this.details);
    this.matchesByElement.add(selector, element);
  }
  selectorUnmatched(element, selector) {
    this.delegate.selectorUnmatched(element, selector, this.details);
    this.matchesByElement.delete(selector, element);
  }
};
var StringMapObserver = class {
  constructor(element, delegate) {
    this.element = element;
    this.delegate = delegate;
    this.started = false;
    this.stringMap = /* @__PURE__ */ new Map();
    this.mutationObserver = new MutationObserver((mutations) => this.processMutations(mutations));
  }
  start() {
    if (!this.started) {
      this.started = true;
      this.mutationObserver.observe(this.element, { attributes: true, attributeOldValue: true });
      this.refresh();
    }
  }
  stop() {
    if (this.started) {
      this.mutationObserver.takeRecords();
      this.mutationObserver.disconnect();
      this.started = false;
    }
  }
  refresh() {
    if (this.started) {
      for (const attributeName of this.knownAttributeNames) {
        this.refreshAttribute(attributeName, null);
      }
    }
  }
  processMutations(mutations) {
    if (this.started) {
      for (const mutation of mutations) {
        this.processMutation(mutation);
      }
    }
  }
  processMutation(mutation) {
    const attributeName = mutation.attributeName;
    if (attributeName) {
      this.refreshAttribute(attributeName, mutation.oldValue);
    }
  }
  refreshAttribute(attributeName, oldValue) {
    const key = this.delegate.getStringMapKeyForAttribute(attributeName);
    if (key != null) {
      if (!this.stringMap.has(attributeName)) {
        this.stringMapKeyAdded(key, attributeName);
      }
      const value = this.element.getAttribute(attributeName);
      if (this.stringMap.get(attributeName) != value) {
        this.stringMapValueChanged(value, key, oldValue);
      }
      if (value == null) {
        const oldValue2 = this.stringMap.get(attributeName);
        this.stringMap.delete(attributeName);
        if (oldValue2)
          this.stringMapKeyRemoved(key, attributeName, oldValue2);
      } else {
        this.stringMap.set(attributeName, value);
      }
    }
  }
  stringMapKeyAdded(key, attributeName) {
    if (this.delegate.stringMapKeyAdded) {
      this.delegate.stringMapKeyAdded(key, attributeName);
    }
  }
  stringMapValueChanged(value, key, oldValue) {
    if (this.delegate.stringMapValueChanged) {
      this.delegate.stringMapValueChanged(value, key, oldValue);
    }
  }
  stringMapKeyRemoved(key, attributeName, oldValue) {
    if (this.delegate.stringMapKeyRemoved) {
      this.delegate.stringMapKeyRemoved(key, attributeName, oldValue);
    }
  }
  get knownAttributeNames() {
    return Array.from(new Set(this.currentAttributeNames.concat(this.recordedAttributeNames)));
  }
  get currentAttributeNames() {
    return Array.from(this.element.attributes).map((attribute) => attribute.name);
  }
  get recordedAttributeNames() {
    return Array.from(this.stringMap.keys());
  }
};
var TokenListObserver = class {
  constructor(element, attributeName, delegate) {
    this.attributeObserver = new AttributeObserver(element, attributeName, this);
    this.delegate = delegate;
    this.tokensByElement = new Multimap();
  }
  get started() {
    return this.attributeObserver.started;
  }
  start() {
    this.attributeObserver.start();
  }
  pause(callback) {
    this.attributeObserver.pause(callback);
  }
  stop() {
    this.attributeObserver.stop();
  }
  refresh() {
    this.attributeObserver.refresh();
  }
  get element() {
    return this.attributeObserver.element;
  }
  get attributeName() {
    return this.attributeObserver.attributeName;
  }
  elementMatchedAttribute(element) {
    this.tokensMatched(this.readTokensForElement(element));
  }
  elementAttributeValueChanged(element) {
    const [unmatchedTokens, matchedTokens] = this.refreshTokensForElement(element);
    this.tokensUnmatched(unmatchedTokens);
    this.tokensMatched(matchedTokens);
  }
  elementUnmatchedAttribute(element) {
    this.tokensUnmatched(this.tokensByElement.getValuesForKey(element));
  }
  tokensMatched(tokens) {
    tokens.forEach((token) => this.tokenMatched(token));
  }
  tokensUnmatched(tokens) {
    tokens.forEach((token) => this.tokenUnmatched(token));
  }
  tokenMatched(token) {
    this.delegate.tokenMatched(token);
    this.tokensByElement.add(token.element, token);
  }
  tokenUnmatched(token) {
    this.delegate.tokenUnmatched(token);
    this.tokensByElement.delete(token.element, token);
  }
  refreshTokensForElement(element) {
    const previousTokens = this.tokensByElement.getValuesForKey(element);
    const currentTokens = this.readTokensForElement(element);
    const firstDifferingIndex = zip(previousTokens, currentTokens).findIndex(([previousToken, currentToken]) => !tokensAreEqual(previousToken, currentToken));
    if (firstDifferingIndex == -1) {
      return [[], []];
    } else {
      return [previousTokens.slice(firstDifferingIndex), currentTokens.slice(firstDifferingIndex)];
    }
  }
  readTokensForElement(element) {
    const attributeName = this.attributeName;
    const tokenString = element.getAttribute(attributeName) || "";
    return parseTokenString(tokenString, element, attributeName);
  }
};
function parseTokenString(tokenString, element, attributeName) {
  return tokenString.trim().split(/\s+/).filter((content) => content.length).map((content, index) => ({ element, attributeName, content, index }));
}
function zip(left2, right2) {
  const length = Math.max(left2.length, right2.length);
  return Array.from({ length }, (_2, index) => [left2[index], right2[index]]);
}
function tokensAreEqual(left2, right2) {
  return left2 && right2 && left2.index == right2.index && left2.content == right2.content;
}
var ValueListObserver = class {
  constructor(element, attributeName, delegate) {
    this.tokenListObserver = new TokenListObserver(element, attributeName, this);
    this.delegate = delegate;
    this.parseResultsByToken = /* @__PURE__ */ new WeakMap();
    this.valuesByTokenByElement = /* @__PURE__ */ new WeakMap();
  }
  get started() {
    return this.tokenListObserver.started;
  }
  start() {
    this.tokenListObserver.start();
  }
  stop() {
    this.tokenListObserver.stop();
  }
  refresh() {
    this.tokenListObserver.refresh();
  }
  get element() {
    return this.tokenListObserver.element;
  }
  get attributeName() {
    return this.tokenListObserver.attributeName;
  }
  tokenMatched(token) {
    const { element } = token;
    const { value } = this.fetchParseResultForToken(token);
    if (value) {
      this.fetchValuesByTokenForElement(element).set(token, value);
      this.delegate.elementMatchedValue(element, value);
    }
  }
  tokenUnmatched(token) {
    const { element } = token;
    const { value } = this.fetchParseResultForToken(token);
    if (value) {
      this.fetchValuesByTokenForElement(element).delete(token);
      this.delegate.elementUnmatchedValue(element, value);
    }
  }
  fetchParseResultForToken(token) {
    let parseResult = this.parseResultsByToken.get(token);
    if (!parseResult) {
      parseResult = this.parseToken(token);
      this.parseResultsByToken.set(token, parseResult);
    }
    return parseResult;
  }
  fetchValuesByTokenForElement(element) {
    let valuesByToken = this.valuesByTokenByElement.get(element);
    if (!valuesByToken) {
      valuesByToken = /* @__PURE__ */ new Map();
      this.valuesByTokenByElement.set(element, valuesByToken);
    }
    return valuesByToken;
  }
  parseToken(token) {
    try {
      const value = this.delegate.parseValueForToken(token);
      return { value };
    } catch (error2) {
      return { error: error2 };
    }
  }
};
var BindingObserver = class {
  constructor(context, delegate) {
    this.context = context;
    this.delegate = delegate;
    this.bindingsByAction = /* @__PURE__ */ new Map();
  }
  start() {
    if (!this.valueListObserver) {
      this.valueListObserver = new ValueListObserver(this.element, this.actionAttribute, this);
      this.valueListObserver.start();
    }
  }
  stop() {
    if (this.valueListObserver) {
      this.valueListObserver.stop();
      delete this.valueListObserver;
      this.disconnectAllActions();
    }
  }
  get element() {
    return this.context.element;
  }
  get identifier() {
    return this.context.identifier;
  }
  get actionAttribute() {
    return this.schema.actionAttribute;
  }
  get schema() {
    return this.context.schema;
  }
  get bindings() {
    return Array.from(this.bindingsByAction.values());
  }
  connectAction(action) {
    const binding = new Binding(this.context, action);
    this.bindingsByAction.set(action, binding);
    this.delegate.bindingConnected(binding);
  }
  disconnectAction(action) {
    const binding = this.bindingsByAction.get(action);
    if (binding) {
      this.bindingsByAction.delete(action);
      this.delegate.bindingDisconnected(binding);
    }
  }
  disconnectAllActions() {
    this.bindings.forEach((binding) => this.delegate.bindingDisconnected(binding, true));
    this.bindingsByAction.clear();
  }
  parseValueForToken(token) {
    const action = Action.forToken(token, this.schema);
    if (action.identifier == this.identifier) {
      return action;
    }
  }
  elementMatchedValue(element, action) {
    this.connectAction(action);
  }
  elementUnmatchedValue(element, action) {
    this.disconnectAction(action);
  }
};
var ValueObserver = class {
  constructor(context, receiver) {
    this.context = context;
    this.receiver = receiver;
    this.stringMapObserver = new StringMapObserver(this.element, this);
    this.valueDescriptorMap = this.controller.valueDescriptorMap;
  }
  start() {
    this.stringMapObserver.start();
    this.invokeChangedCallbacksForDefaultValues();
  }
  stop() {
    this.stringMapObserver.stop();
  }
  get element() {
    return this.context.element;
  }
  get controller() {
    return this.context.controller;
  }
  getStringMapKeyForAttribute(attributeName) {
    if (attributeName in this.valueDescriptorMap) {
      return this.valueDescriptorMap[attributeName].name;
    }
  }
  stringMapKeyAdded(key, attributeName) {
    const descriptor = this.valueDescriptorMap[attributeName];
    if (!this.hasValue(key)) {
      this.invokeChangedCallback(key, descriptor.writer(this.receiver[key]), descriptor.writer(descriptor.defaultValue));
    }
  }
  stringMapValueChanged(value, name, oldValue) {
    const descriptor = this.valueDescriptorNameMap[name];
    if (value === null)
      return;
    if (oldValue === null) {
      oldValue = descriptor.writer(descriptor.defaultValue);
    }
    this.invokeChangedCallback(name, value, oldValue);
  }
  stringMapKeyRemoved(key, attributeName, oldValue) {
    const descriptor = this.valueDescriptorNameMap[key];
    if (this.hasValue(key)) {
      this.invokeChangedCallback(key, descriptor.writer(this.receiver[key]), oldValue);
    } else {
      this.invokeChangedCallback(key, descriptor.writer(descriptor.defaultValue), oldValue);
    }
  }
  invokeChangedCallbacksForDefaultValues() {
    for (const { key, name, defaultValue, writer } of this.valueDescriptors) {
      if (defaultValue != void 0 && !this.controller.data.has(key)) {
        this.invokeChangedCallback(name, writer(defaultValue), void 0);
      }
    }
  }
  invokeChangedCallback(name, rawValue, rawOldValue) {
    const changedMethodName = `${name}Changed`;
    const changedMethod = this.receiver[changedMethodName];
    if (typeof changedMethod == "function") {
      const descriptor = this.valueDescriptorNameMap[name];
      try {
        const value = descriptor.reader(rawValue);
        let oldValue = rawOldValue;
        if (rawOldValue) {
          oldValue = descriptor.reader(rawOldValue);
        }
        changedMethod.call(this.receiver, value, oldValue);
      } catch (error2) {
        if (error2 instanceof TypeError) {
          error2.message = `Stimulus Value "${this.context.identifier}.${descriptor.name}" - ${error2.message}`;
        }
        throw error2;
      }
    }
  }
  get valueDescriptors() {
    const { valueDescriptorMap } = this;
    return Object.keys(valueDescriptorMap).map((key) => valueDescriptorMap[key]);
  }
  get valueDescriptorNameMap() {
    const descriptors = {};
    Object.keys(this.valueDescriptorMap).forEach((key) => {
      const descriptor = this.valueDescriptorMap[key];
      descriptors[descriptor.name] = descriptor;
    });
    return descriptors;
  }
  hasValue(attributeName) {
    const descriptor = this.valueDescriptorNameMap[attributeName];
    const hasMethodName = `has${capitalize(descriptor.name)}`;
    return this.receiver[hasMethodName];
  }
};
var TargetObserver = class {
  constructor(context, delegate) {
    this.context = context;
    this.delegate = delegate;
    this.targetsByName = new Multimap();
  }
  start() {
    if (!this.tokenListObserver) {
      this.tokenListObserver = new TokenListObserver(this.element, this.attributeName, this);
      this.tokenListObserver.start();
    }
  }
  stop() {
    if (this.tokenListObserver) {
      this.disconnectAllTargets();
      this.tokenListObserver.stop();
      delete this.tokenListObserver;
    }
  }
  tokenMatched({ element, content: name }) {
    if (this.scope.containsElement(element)) {
      this.connectTarget(element, name);
    }
  }
  tokenUnmatched({ element, content: name }) {
    this.disconnectTarget(element, name);
  }
  connectTarget(element, name) {
    var _a;
    if (!this.targetsByName.has(name, element)) {
      this.targetsByName.add(name, element);
      (_a = this.tokenListObserver) === null || _a === void 0 ? void 0 : _a.pause(() => this.delegate.targetConnected(element, name));
    }
  }
  disconnectTarget(element, name) {
    var _a;
    if (this.targetsByName.has(name, element)) {
      this.targetsByName.delete(name, element);
      (_a = this.tokenListObserver) === null || _a === void 0 ? void 0 : _a.pause(() => this.delegate.targetDisconnected(element, name));
    }
  }
  disconnectAllTargets() {
    for (const name of this.targetsByName.keys) {
      for (const element of this.targetsByName.getValuesForKey(name)) {
        this.disconnectTarget(element, name);
      }
    }
  }
  get attributeName() {
    return `data-${this.context.identifier}-target`;
  }
  get element() {
    return this.context.element;
  }
  get scope() {
    return this.context.scope;
  }
};
function readInheritableStaticArrayValues(constructor, propertyName) {
  const ancestors = getAncestorsForConstructor(constructor);
  return Array.from(ancestors.reduce((values, constructor2) => {
    getOwnStaticArrayValues(constructor2, propertyName).forEach((name) => values.add(name));
    return values;
  }, /* @__PURE__ */ new Set()));
}
function readInheritableStaticObjectPairs(constructor, propertyName) {
  const ancestors = getAncestorsForConstructor(constructor);
  return ancestors.reduce((pairs, constructor2) => {
    pairs.push(...getOwnStaticObjectPairs(constructor2, propertyName));
    return pairs;
  }, []);
}
function getAncestorsForConstructor(constructor) {
  const ancestors = [];
  while (constructor) {
    ancestors.push(constructor);
    constructor = Object.getPrototypeOf(constructor);
  }
  return ancestors.reverse();
}
function getOwnStaticArrayValues(constructor, propertyName) {
  const definition = constructor[propertyName];
  return Array.isArray(definition) ? definition : [];
}
function getOwnStaticObjectPairs(constructor, propertyName) {
  const definition = constructor[propertyName];
  return definition ? Object.keys(definition).map((key) => [key, definition[key]]) : [];
}
var OutletObserver = class {
  constructor(context, delegate) {
    this.started = false;
    this.context = context;
    this.delegate = delegate;
    this.outletsByName = new Multimap();
    this.outletElementsByName = new Multimap();
    this.selectorObserverMap = /* @__PURE__ */ new Map();
    this.attributeObserverMap = /* @__PURE__ */ new Map();
  }
  start() {
    if (!this.started) {
      this.outletDefinitions.forEach((outletName) => {
        this.setupSelectorObserverForOutlet(outletName);
        this.setupAttributeObserverForOutlet(outletName);
      });
      this.started = true;
      this.dependentContexts.forEach((context) => context.refresh());
    }
  }
  refresh() {
    this.selectorObserverMap.forEach((observer) => observer.refresh());
    this.attributeObserverMap.forEach((observer) => observer.refresh());
  }
  stop() {
    if (this.started) {
      this.started = false;
      this.disconnectAllOutlets();
      this.stopSelectorObservers();
      this.stopAttributeObservers();
    }
  }
  stopSelectorObservers() {
    if (this.selectorObserverMap.size > 0) {
      this.selectorObserverMap.forEach((observer) => observer.stop());
      this.selectorObserverMap.clear();
    }
  }
  stopAttributeObservers() {
    if (this.attributeObserverMap.size > 0) {
      this.attributeObserverMap.forEach((observer) => observer.stop());
      this.attributeObserverMap.clear();
    }
  }
  selectorMatched(element, _selector, { outletName }) {
    const outlet = this.getOutlet(element, outletName);
    if (outlet) {
      this.connectOutlet(outlet, element, outletName);
    }
  }
  selectorUnmatched(element, _selector, { outletName }) {
    const outlet = this.getOutletFromMap(element, outletName);
    if (outlet) {
      this.disconnectOutlet(outlet, element, outletName);
    }
  }
  selectorMatchElement(element, { outletName }) {
    const selector = this.selector(outletName);
    const hasOutlet = this.hasOutlet(element, outletName);
    const hasOutletController = element.matches(`[${this.schema.controllerAttribute}~=${outletName}]`);
    if (selector) {
      return hasOutlet && hasOutletController && element.matches(selector);
    } else {
      return false;
    }
  }
  elementMatchedAttribute(_element, attributeName) {
    const outletName = this.getOutletNameFromOutletAttributeName(attributeName);
    if (outletName) {
      this.updateSelectorObserverForOutlet(outletName);
    }
  }
  elementAttributeValueChanged(_element, attributeName) {
    const outletName = this.getOutletNameFromOutletAttributeName(attributeName);
    if (outletName) {
      this.updateSelectorObserverForOutlet(outletName);
    }
  }
  elementUnmatchedAttribute(_element, attributeName) {
    const outletName = this.getOutletNameFromOutletAttributeName(attributeName);
    if (outletName) {
      this.updateSelectorObserverForOutlet(outletName);
    }
  }
  connectOutlet(outlet, element, outletName) {
    var _a;
    if (!this.outletElementsByName.has(outletName, element)) {
      this.outletsByName.add(outletName, outlet);
      this.outletElementsByName.add(outletName, element);
      (_a = this.selectorObserverMap.get(outletName)) === null || _a === void 0 ? void 0 : _a.pause(() => this.delegate.outletConnected(outlet, element, outletName));
    }
  }
  disconnectOutlet(outlet, element, outletName) {
    var _a;
    if (this.outletElementsByName.has(outletName, element)) {
      this.outletsByName.delete(outletName, outlet);
      this.outletElementsByName.delete(outletName, element);
      (_a = this.selectorObserverMap.get(outletName)) === null || _a === void 0 ? void 0 : _a.pause(() => this.delegate.outletDisconnected(outlet, element, outletName));
    }
  }
  disconnectAllOutlets() {
    for (const outletName of this.outletElementsByName.keys) {
      for (const element of this.outletElementsByName.getValuesForKey(outletName)) {
        for (const outlet of this.outletsByName.getValuesForKey(outletName)) {
          this.disconnectOutlet(outlet, element, outletName);
        }
      }
    }
  }
  updateSelectorObserverForOutlet(outletName) {
    const observer = this.selectorObserverMap.get(outletName);
    if (observer) {
      observer.selector = this.selector(outletName);
    }
  }
  setupSelectorObserverForOutlet(outletName) {
    const selector = this.selector(outletName);
    const selectorObserver = new SelectorObserver(document.body, selector, this, { outletName });
    this.selectorObserverMap.set(outletName, selectorObserver);
    selectorObserver.start();
  }
  setupAttributeObserverForOutlet(outletName) {
    const attributeName = this.attributeNameForOutletName(outletName);
    const attributeObserver = new AttributeObserver(this.scope.element, attributeName, this);
    this.attributeObserverMap.set(outletName, attributeObserver);
    attributeObserver.start();
  }
  selector(outletName) {
    return this.scope.outlets.getSelectorForOutletName(outletName);
  }
  attributeNameForOutletName(outletName) {
    return this.scope.schema.outletAttributeForScope(this.identifier, outletName);
  }
  getOutletNameFromOutletAttributeName(attributeName) {
    return this.outletDefinitions.find((outletName) => this.attributeNameForOutletName(outletName) === attributeName);
  }
  get outletDependencies() {
    const dependencies = new Multimap();
    this.router.modules.forEach((module) => {
      const constructor = module.definition.controllerConstructor;
      const outlets = readInheritableStaticArrayValues(constructor, "outlets");
      outlets.forEach((outlet) => dependencies.add(outlet, module.identifier));
    });
    return dependencies;
  }
  get outletDefinitions() {
    return this.outletDependencies.getKeysForValue(this.identifier);
  }
  get dependentControllerIdentifiers() {
    return this.outletDependencies.getValuesForKey(this.identifier);
  }
  get dependentContexts() {
    const identifiers = this.dependentControllerIdentifiers;
    return this.router.contexts.filter((context) => identifiers.includes(context.identifier));
  }
  hasOutlet(element, outletName) {
    return !!this.getOutlet(element, outletName) || !!this.getOutletFromMap(element, outletName);
  }
  getOutlet(element, outletName) {
    return this.application.getControllerForElementAndIdentifier(element, outletName);
  }
  getOutletFromMap(element, outletName) {
    return this.outletsByName.getValuesForKey(outletName).find((outlet) => outlet.element === element);
  }
  get scope() {
    return this.context.scope;
  }
  get schema() {
    return this.context.schema;
  }
  get identifier() {
    return this.context.identifier;
  }
  get application() {
    return this.context.application;
  }
  get router() {
    return this.application.router;
  }
};
var Context = class {
  constructor(module, scope) {
    this.logDebugActivity = (functionName, detail = {}) => {
      const { identifier, controller, element } = this;
      detail = Object.assign({ identifier, controller, element }, detail);
      this.application.logDebugActivity(this.identifier, functionName, detail);
    };
    this.module = module;
    this.scope = scope;
    this.controller = new module.controllerConstructor(this);
    this.bindingObserver = new BindingObserver(this, this.dispatcher);
    this.valueObserver = new ValueObserver(this, this.controller);
    this.targetObserver = new TargetObserver(this, this);
    this.outletObserver = new OutletObserver(this, this);
    try {
      this.controller.initialize();
      this.logDebugActivity("initialize");
    } catch (error2) {
      this.handleError(error2, "initializing controller");
    }
  }
  connect() {
    this.bindingObserver.start();
    this.valueObserver.start();
    this.targetObserver.start();
    this.outletObserver.start();
    try {
      this.controller.connect();
      this.logDebugActivity("connect");
    } catch (error2) {
      this.handleError(error2, "connecting controller");
    }
  }
  refresh() {
    this.outletObserver.refresh();
  }
  disconnect() {
    try {
      this.controller.disconnect();
      this.logDebugActivity("disconnect");
    } catch (error2) {
      this.handleError(error2, "disconnecting controller");
    }
    this.outletObserver.stop();
    this.targetObserver.stop();
    this.valueObserver.stop();
    this.bindingObserver.stop();
  }
  get application() {
    return this.module.application;
  }
  get identifier() {
    return this.module.identifier;
  }
  get schema() {
    return this.application.schema;
  }
  get dispatcher() {
    return this.application.dispatcher;
  }
  get element() {
    return this.scope.element;
  }
  get parentElement() {
    return this.element.parentElement;
  }
  handleError(error2, message, detail = {}) {
    const { identifier, controller, element } = this;
    detail = Object.assign({ identifier, controller, element }, detail);
    this.application.handleError(error2, `Error ${message}`, detail);
  }
  targetConnected(element, name) {
    this.invokeControllerMethod(`${name}TargetConnected`, element);
  }
  targetDisconnected(element, name) {
    this.invokeControllerMethod(`${name}TargetDisconnected`, element);
  }
  outletConnected(outlet, element, name) {
    this.invokeControllerMethod(`${namespaceCamelize(name)}OutletConnected`, outlet, element);
  }
  outletDisconnected(outlet, element, name) {
    this.invokeControllerMethod(`${namespaceCamelize(name)}OutletDisconnected`, outlet, element);
  }
  invokeControllerMethod(methodName, ...args) {
    const controller = this.controller;
    if (typeof controller[methodName] == "function") {
      controller[methodName](...args);
    }
  }
};
function bless(constructor) {
  return shadow(constructor, getBlessedProperties(constructor));
}
function shadow(constructor, properties) {
  const shadowConstructor = extend2(constructor);
  const shadowProperties = getShadowProperties(constructor.prototype, properties);
  Object.defineProperties(shadowConstructor.prototype, shadowProperties);
  return shadowConstructor;
}
function getBlessedProperties(constructor) {
  const blessings = readInheritableStaticArrayValues(constructor, "blessings");
  return blessings.reduce((blessedProperties, blessing) => {
    const properties = blessing(constructor);
    for (const key in properties) {
      const descriptor = blessedProperties[key] || {};
      blessedProperties[key] = Object.assign(descriptor, properties[key]);
    }
    return blessedProperties;
  }, {});
}
function getShadowProperties(prototype, properties) {
  return getOwnKeys(properties).reduce((shadowProperties, key) => {
    const descriptor = getShadowedDescriptor(prototype, properties, key);
    if (descriptor) {
      Object.assign(shadowProperties, { [key]: descriptor });
    }
    return shadowProperties;
  }, {});
}
function getShadowedDescriptor(prototype, properties, key) {
  const shadowingDescriptor = Object.getOwnPropertyDescriptor(prototype, key);
  const shadowedByValue = shadowingDescriptor && "value" in shadowingDescriptor;
  if (!shadowedByValue) {
    const descriptor = Object.getOwnPropertyDescriptor(properties, key).value;
    if (shadowingDescriptor) {
      descriptor.get = shadowingDescriptor.get || descriptor.get;
      descriptor.set = shadowingDescriptor.set || descriptor.set;
    }
    return descriptor;
  }
}
var getOwnKeys = (() => {
  if (typeof Object.getOwnPropertySymbols == "function") {
    return (object) => [...Object.getOwnPropertyNames(object), ...Object.getOwnPropertySymbols(object)];
  } else {
    return Object.getOwnPropertyNames;
  }
})();
var extend2 = (() => {
  function extendWithReflect(constructor) {
    function extended() {
      return Reflect.construct(constructor, arguments, new.target);
    }
    extended.prototype = Object.create(constructor.prototype, {
      constructor: { value: extended }
    });
    Reflect.setPrototypeOf(extended, constructor);
    return extended;
  }
  function testReflectExtension() {
    const a2 = function() {
      this.a.call(this);
    };
    const b2 = extendWithReflect(a2);
    b2.prototype.a = function() {
    };
    return new b2();
  }
  try {
    testReflectExtension();
    return extendWithReflect;
  } catch (error2) {
    return (constructor) => class extended extends constructor {
    };
  }
})();
function blessDefinition(definition) {
  return {
    identifier: definition.identifier,
    controllerConstructor: bless(definition.controllerConstructor)
  };
}
var Module = class {
  constructor(application2, definition) {
    this.application = application2;
    this.definition = blessDefinition(definition);
    this.contextsByScope = /* @__PURE__ */ new WeakMap();
    this.connectedContexts = /* @__PURE__ */ new Set();
  }
  get identifier() {
    return this.definition.identifier;
  }
  get controllerConstructor() {
    return this.definition.controllerConstructor;
  }
  get contexts() {
    return Array.from(this.connectedContexts);
  }
  connectContextForScope(scope) {
    const context = this.fetchContextForScope(scope);
    this.connectedContexts.add(context);
    context.connect();
  }
  disconnectContextForScope(scope) {
    const context = this.contextsByScope.get(scope);
    if (context) {
      this.connectedContexts.delete(context);
      context.disconnect();
    }
  }
  fetchContextForScope(scope) {
    let context = this.contextsByScope.get(scope);
    if (!context) {
      context = new Context(this, scope);
      this.contextsByScope.set(scope, context);
    }
    return context;
  }
};
var ClassMap = class {
  constructor(scope) {
    this.scope = scope;
  }
  has(name) {
    return this.data.has(this.getDataKey(name));
  }
  get(name) {
    return this.getAll(name)[0];
  }
  getAll(name) {
    const tokenString = this.data.get(this.getDataKey(name)) || "";
    return tokenize(tokenString);
  }
  getAttributeName(name) {
    return this.data.getAttributeNameForKey(this.getDataKey(name));
  }
  getDataKey(name) {
    return `${name}-class`;
  }
  get data() {
    return this.scope.data;
  }
};
var DataMap = class {
  constructor(scope) {
    this.scope = scope;
  }
  get element() {
    return this.scope.element;
  }
  get identifier() {
    return this.scope.identifier;
  }
  get(key) {
    const name = this.getAttributeNameForKey(key);
    return this.element.getAttribute(name);
  }
  set(key, value) {
    const name = this.getAttributeNameForKey(key);
    this.element.setAttribute(name, value);
    return this.get(key);
  }
  has(key) {
    const name = this.getAttributeNameForKey(key);
    return this.element.hasAttribute(name);
  }
  delete(key) {
    if (this.has(key)) {
      const name = this.getAttributeNameForKey(key);
      this.element.removeAttribute(name);
      return true;
    } else {
      return false;
    }
  }
  getAttributeNameForKey(key) {
    return `data-${this.identifier}-${dasherize(key)}`;
  }
};
var Guide = class {
  constructor(logger) {
    this.warnedKeysByObject = /* @__PURE__ */ new WeakMap();
    this.logger = logger;
  }
  warn(object, key, message) {
    let warnedKeys = this.warnedKeysByObject.get(object);
    if (!warnedKeys) {
      warnedKeys = /* @__PURE__ */ new Set();
      this.warnedKeysByObject.set(object, warnedKeys);
    }
    if (!warnedKeys.has(key)) {
      warnedKeys.add(key);
      this.logger.warn(message, object);
    }
  }
};
function attributeValueContainsToken(attributeName, token) {
  return `[${attributeName}~="${token}"]`;
}
var TargetSet = class {
  constructor(scope) {
    this.scope = scope;
  }
  get element() {
    return this.scope.element;
  }
  get identifier() {
    return this.scope.identifier;
  }
  get schema() {
    return this.scope.schema;
  }
  has(targetName) {
    return this.find(targetName) != null;
  }
  find(...targetNames) {
    return targetNames.reduce((target, targetName) => target || this.findTarget(targetName) || this.findLegacyTarget(targetName), void 0);
  }
  findAll(...targetNames) {
    return targetNames.reduce((targets, targetName) => [
      ...targets,
      ...this.findAllTargets(targetName),
      ...this.findAllLegacyTargets(targetName)
    ], []);
  }
  findTarget(targetName) {
    const selector = this.getSelectorForTargetName(targetName);
    return this.scope.findElement(selector);
  }
  findAllTargets(targetName) {
    const selector = this.getSelectorForTargetName(targetName);
    return this.scope.findAllElements(selector);
  }
  getSelectorForTargetName(targetName) {
    const attributeName = this.schema.targetAttributeForScope(this.identifier);
    return attributeValueContainsToken(attributeName, targetName);
  }
  findLegacyTarget(targetName) {
    const selector = this.getLegacySelectorForTargetName(targetName);
    return this.deprecate(this.scope.findElement(selector), targetName);
  }
  findAllLegacyTargets(targetName) {
    const selector = this.getLegacySelectorForTargetName(targetName);
    return this.scope.findAllElements(selector).map((element) => this.deprecate(element, targetName));
  }
  getLegacySelectorForTargetName(targetName) {
    const targetDescriptor = `${this.identifier}.${targetName}`;
    return attributeValueContainsToken(this.schema.targetAttribute, targetDescriptor);
  }
  deprecate(element, targetName) {
    if (element) {
      const { identifier } = this;
      const attributeName = this.schema.targetAttribute;
      const revisedAttributeName = this.schema.targetAttributeForScope(identifier);
      this.guide.warn(element, `target:${targetName}`, `Please replace ${attributeName}="${identifier}.${targetName}" with ${revisedAttributeName}="${targetName}". The ${attributeName} attribute is deprecated and will be removed in a future version of Stimulus.`);
    }
    return element;
  }
  get guide() {
    return this.scope.guide;
  }
};
var OutletSet = class {
  constructor(scope, controllerElement) {
    this.scope = scope;
    this.controllerElement = controllerElement;
  }
  get element() {
    return this.scope.element;
  }
  get identifier() {
    return this.scope.identifier;
  }
  get schema() {
    return this.scope.schema;
  }
  has(outletName) {
    return this.find(outletName) != null;
  }
  find(...outletNames) {
    return outletNames.reduce((outlet, outletName) => outlet || this.findOutlet(outletName), void 0);
  }
  findAll(...outletNames) {
    return outletNames.reduce((outlets, outletName) => [...outlets, ...this.findAllOutlets(outletName)], []);
  }
  getSelectorForOutletName(outletName) {
    const attributeName = this.schema.outletAttributeForScope(this.identifier, outletName);
    return this.controllerElement.getAttribute(attributeName);
  }
  findOutlet(outletName) {
    const selector = this.getSelectorForOutletName(outletName);
    if (selector)
      return this.findElement(selector, outletName);
  }
  findAllOutlets(outletName) {
    const selector = this.getSelectorForOutletName(outletName);
    return selector ? this.findAllElements(selector, outletName) : [];
  }
  findElement(selector, outletName) {
    const elements = this.scope.queryElements(selector);
    return elements.filter((element) => this.matchesElement(element, selector, outletName))[0];
  }
  findAllElements(selector, outletName) {
    const elements = this.scope.queryElements(selector);
    return elements.filter((element) => this.matchesElement(element, selector, outletName));
  }
  matchesElement(element, selector, outletName) {
    const controllerAttribute = element.getAttribute(this.scope.schema.controllerAttribute) || "";
    return element.matches(selector) && controllerAttribute.split(" ").includes(outletName);
  }
};
var Scope = class _Scope {
  constructor(schema, element, identifier, logger) {
    this.targets = new TargetSet(this);
    this.classes = new ClassMap(this);
    this.data = new DataMap(this);
    this.containsElement = (element2) => {
      return element2.closest(this.controllerSelector) === this.element;
    };
    this.schema = schema;
    this.element = element;
    this.identifier = identifier;
    this.guide = new Guide(logger);
    this.outlets = new OutletSet(this.documentScope, element);
  }
  findElement(selector) {
    return this.element.matches(selector) ? this.element : this.queryElements(selector).find(this.containsElement);
  }
  findAllElements(selector) {
    return [
      ...this.element.matches(selector) ? [this.element] : [],
      ...this.queryElements(selector).filter(this.containsElement)
    ];
  }
  queryElements(selector) {
    return Array.from(this.element.querySelectorAll(selector));
  }
  get controllerSelector() {
    return attributeValueContainsToken(this.schema.controllerAttribute, this.identifier);
  }
  get isDocumentScope() {
    return this.element === document.documentElement;
  }
  get documentScope() {
    return this.isDocumentScope ? this : new _Scope(this.schema, document.documentElement, this.identifier, this.guide.logger);
  }
};
var ScopeObserver = class {
  constructor(element, schema, delegate) {
    this.element = element;
    this.schema = schema;
    this.delegate = delegate;
    this.valueListObserver = new ValueListObserver(this.element, this.controllerAttribute, this);
    this.scopesByIdentifierByElement = /* @__PURE__ */ new WeakMap();
    this.scopeReferenceCounts = /* @__PURE__ */ new WeakMap();
  }
  start() {
    this.valueListObserver.start();
  }
  stop() {
    this.valueListObserver.stop();
  }
  get controllerAttribute() {
    return this.schema.controllerAttribute;
  }
  parseValueForToken(token) {
    const { element, content: identifier } = token;
    return this.parseValueForElementAndIdentifier(element, identifier);
  }
  parseValueForElementAndIdentifier(element, identifier) {
    const scopesByIdentifier = this.fetchScopesByIdentifierForElement(element);
    let scope = scopesByIdentifier.get(identifier);
    if (!scope) {
      scope = this.delegate.createScopeForElementAndIdentifier(element, identifier);
      scopesByIdentifier.set(identifier, scope);
    }
    return scope;
  }
  elementMatchedValue(element, value) {
    const referenceCount = (this.scopeReferenceCounts.get(value) || 0) + 1;
    this.scopeReferenceCounts.set(value, referenceCount);
    if (referenceCount == 1) {
      this.delegate.scopeConnected(value);
    }
  }
  elementUnmatchedValue(element, value) {
    const referenceCount = this.scopeReferenceCounts.get(value);
    if (referenceCount) {
      this.scopeReferenceCounts.set(value, referenceCount - 1);
      if (referenceCount == 1) {
        this.delegate.scopeDisconnected(value);
      }
    }
  }
  fetchScopesByIdentifierForElement(element) {
    let scopesByIdentifier = this.scopesByIdentifierByElement.get(element);
    if (!scopesByIdentifier) {
      scopesByIdentifier = /* @__PURE__ */ new Map();
      this.scopesByIdentifierByElement.set(element, scopesByIdentifier);
    }
    return scopesByIdentifier;
  }
};
var Router = class {
  constructor(application2) {
    this.application = application2;
    this.scopeObserver = new ScopeObserver(this.element, this.schema, this);
    this.scopesByIdentifier = new Multimap();
    this.modulesByIdentifier = /* @__PURE__ */ new Map();
  }
  get element() {
    return this.application.element;
  }
  get schema() {
    return this.application.schema;
  }
  get logger() {
    return this.application.logger;
  }
  get controllerAttribute() {
    return this.schema.controllerAttribute;
  }
  get modules() {
    return Array.from(this.modulesByIdentifier.values());
  }
  get contexts() {
    return this.modules.reduce((contexts, module) => contexts.concat(module.contexts), []);
  }
  start() {
    this.scopeObserver.start();
  }
  stop() {
    this.scopeObserver.stop();
  }
  loadDefinition(definition) {
    this.unloadIdentifier(definition.identifier);
    const module = new Module(this.application, definition);
    this.connectModule(module);
    const afterLoad = definition.controllerConstructor.afterLoad;
    if (afterLoad) {
      afterLoad.call(definition.controllerConstructor, definition.identifier, this.application);
    }
  }
  unloadIdentifier(identifier) {
    const module = this.modulesByIdentifier.get(identifier);
    if (module) {
      this.disconnectModule(module);
    }
  }
  getContextForElementAndIdentifier(element, identifier) {
    const module = this.modulesByIdentifier.get(identifier);
    if (module) {
      return module.contexts.find((context) => context.element == element);
    }
  }
  proposeToConnectScopeForElementAndIdentifier(element, identifier) {
    const scope = this.scopeObserver.parseValueForElementAndIdentifier(element, identifier);
    if (scope) {
      this.scopeObserver.elementMatchedValue(scope.element, scope);
    } else {
      console.error(`Couldn't find or create scope for identifier: "${identifier}" and element:`, element);
    }
  }
  handleError(error2, message, detail) {
    this.application.handleError(error2, message, detail);
  }
  createScopeForElementAndIdentifier(element, identifier) {
    return new Scope(this.schema, element, identifier, this.logger);
  }
  scopeConnected(scope) {
    this.scopesByIdentifier.add(scope.identifier, scope);
    const module = this.modulesByIdentifier.get(scope.identifier);
    if (module) {
      module.connectContextForScope(scope);
    }
  }
  scopeDisconnected(scope) {
    this.scopesByIdentifier.delete(scope.identifier, scope);
    const module = this.modulesByIdentifier.get(scope.identifier);
    if (module) {
      module.disconnectContextForScope(scope);
    }
  }
  connectModule(module) {
    this.modulesByIdentifier.set(module.identifier, module);
    const scopes = this.scopesByIdentifier.getValuesForKey(module.identifier);
    scopes.forEach((scope) => module.connectContextForScope(scope));
  }
  disconnectModule(module) {
    this.modulesByIdentifier.delete(module.identifier);
    const scopes = this.scopesByIdentifier.getValuesForKey(module.identifier);
    scopes.forEach((scope) => module.disconnectContextForScope(scope));
  }
};
var defaultSchema = {
  controllerAttribute: "data-controller",
  actionAttribute: "data-action",
  targetAttribute: "data-target",
  targetAttributeForScope: (identifier) => `data-${identifier}-target`,
  outletAttributeForScope: (identifier, outlet) => `data-${identifier}-${outlet}-outlet`,
  keyMappings: Object.assign(Object.assign({ enter: "Enter", tab: "Tab", esc: "Escape", space: " ", up: "ArrowUp", down: "ArrowDown", left: "ArrowLeft", right: "ArrowRight", home: "Home", end: "End", page_up: "PageUp", page_down: "PageDown" }, objectFromEntries("abcdefghijklmnopqrstuvwxyz".split("").map((c2) => [c2, c2]))), objectFromEntries("0123456789".split("").map((n2) => [n2, n2])))
};
function objectFromEntries(array) {
  return array.reduce((memo, [k2, v2]) => Object.assign(Object.assign({}, memo), { [k2]: v2 }), {});
}
var Application = class {
  constructor(element = document.documentElement, schema = defaultSchema) {
    this.logger = console;
    this.debug = false;
    this.logDebugActivity = (identifier, functionName, detail = {}) => {
      if (this.debug) {
        this.logFormattedMessage(identifier, functionName, detail);
      }
    };
    this.element = element;
    this.schema = schema;
    this.dispatcher = new Dispatcher(this);
    this.router = new Router(this);
    this.actionDescriptorFilters = Object.assign({}, defaultActionDescriptorFilters);
  }
  static start(element, schema) {
    const application2 = new this(element, schema);
    application2.start();
    return application2;
  }
  async start() {
    await domReady();
    this.logDebugActivity("application", "starting");
    this.dispatcher.start();
    this.router.start();
    this.logDebugActivity("application", "start");
  }
  stop() {
    this.logDebugActivity("application", "stopping");
    this.dispatcher.stop();
    this.router.stop();
    this.logDebugActivity("application", "stop");
  }
  register(identifier, controllerConstructor) {
    this.load({ identifier, controllerConstructor });
  }
  registerActionOption(name, filter) {
    this.actionDescriptorFilters[name] = filter;
  }
  load(head, ...rest) {
    const definitions = Array.isArray(head) ? head : [head, ...rest];
    definitions.forEach((definition) => {
      if (definition.controllerConstructor.shouldLoad) {
        this.router.loadDefinition(definition);
      }
    });
  }
  unload(head, ...rest) {
    const identifiers = Array.isArray(head) ? head : [head, ...rest];
    identifiers.forEach((identifier) => this.router.unloadIdentifier(identifier));
  }
  get controllers() {
    return this.router.contexts.map((context) => context.controller);
  }
  getControllerForElementAndIdentifier(element, identifier) {
    const context = this.router.getContextForElementAndIdentifier(element, identifier);
    return context ? context.controller : null;
  }
  handleError(error2, message, detail) {
    var _a;
    this.logger.error(`%s

%o

%o`, message, error2, detail);
    (_a = window.onerror) === null || _a === void 0 ? void 0 : _a.call(window, message, "", 0, 0, error2);
  }
  logFormattedMessage(identifier, functionName, detail = {}) {
    detail = Object.assign({ application: this }, detail);
    this.logger.groupCollapsed(`${identifier} #${functionName}`);
    this.logger.log("details:", Object.assign({}, detail));
    this.logger.groupEnd();
  }
};
function domReady() {
  return new Promise((resolve) => {
    if (document.readyState == "loading") {
      document.addEventListener("DOMContentLoaded", () => resolve());
    } else {
      resolve();
    }
  });
}
function ClassPropertiesBlessing(constructor) {
  const classes = readInheritableStaticArrayValues(constructor, "classes");
  return classes.reduce((properties, classDefinition) => {
    return Object.assign(properties, propertiesForClassDefinition(classDefinition));
  }, {});
}
function propertiesForClassDefinition(key) {
  return {
    [`${key}Class`]: {
      get() {
        const { classes } = this;
        if (classes.has(key)) {
          return classes.get(key);
        } else {
          const attribute = classes.getAttributeName(key);
          throw new Error(`Missing attribute "${attribute}"`);
        }
      }
    },
    [`${key}Classes`]: {
      get() {
        return this.classes.getAll(key);
      }
    },
    [`has${capitalize(key)}Class`]: {
      get() {
        return this.classes.has(key);
      }
    }
  };
}
function OutletPropertiesBlessing(constructor) {
  const outlets = readInheritableStaticArrayValues(constructor, "outlets");
  return outlets.reduce((properties, outletDefinition) => {
    return Object.assign(properties, propertiesForOutletDefinition(outletDefinition));
  }, {});
}
function getOutletController(controller, element, identifier) {
  return controller.application.getControllerForElementAndIdentifier(element, identifier);
}
function getControllerAndEnsureConnectedScope(controller, element, outletName) {
  let outletController = getOutletController(controller, element, outletName);
  if (outletController)
    return outletController;
  controller.application.router.proposeToConnectScopeForElementAndIdentifier(element, outletName);
  outletController = getOutletController(controller, element, outletName);
  if (outletController)
    return outletController;
}
function propertiesForOutletDefinition(name) {
  const camelizedName = namespaceCamelize(name);
  return {
    [`${camelizedName}Outlet`]: {
      get() {
        const outletElement = this.outlets.find(name);
        const selector = this.outlets.getSelectorForOutletName(name);
        if (outletElement) {
          const outletController = getControllerAndEnsureConnectedScope(this, outletElement, name);
          if (outletController)
            return outletController;
          throw new Error(`The provided outlet element is missing an outlet controller "${name}" instance for host controller "${this.identifier}"`);
        }
        throw new Error(`Missing outlet element "${name}" for host controller "${this.identifier}". Stimulus couldn't find a matching outlet element using selector "${selector}".`);
      }
    },
    [`${camelizedName}Outlets`]: {
      get() {
        const outlets = this.outlets.findAll(name);
        if (outlets.length > 0) {
          return outlets.map((outletElement) => {
            const outletController = getControllerAndEnsureConnectedScope(this, outletElement, name);
            if (outletController)
              return outletController;
            console.warn(`The provided outlet element is missing an outlet controller "${name}" instance for host controller "${this.identifier}"`, outletElement);
          }).filter((controller) => controller);
        }
        return [];
      }
    },
    [`${camelizedName}OutletElement`]: {
      get() {
        const outletElement = this.outlets.find(name);
        const selector = this.outlets.getSelectorForOutletName(name);
        if (outletElement) {
          return outletElement;
        } else {
          throw new Error(`Missing outlet element "${name}" for host controller "${this.identifier}". Stimulus couldn't find a matching outlet element using selector "${selector}".`);
        }
      }
    },
    [`${camelizedName}OutletElements`]: {
      get() {
        return this.outlets.findAll(name);
      }
    },
    [`has${capitalize(camelizedName)}Outlet`]: {
      get() {
        return this.outlets.has(name);
      }
    }
  };
}
function TargetPropertiesBlessing(constructor) {
  const targets = readInheritableStaticArrayValues(constructor, "targets");
  return targets.reduce((properties, targetDefinition) => {
    return Object.assign(properties, propertiesForTargetDefinition(targetDefinition));
  }, {});
}
function propertiesForTargetDefinition(name) {
  return {
    [`${name}Target`]: {
      get() {
        const target = this.targets.find(name);
        if (target) {
          return target;
        } else {
          throw new Error(`Missing target element "${name}" for "${this.identifier}" controller`);
        }
      }
    },
    [`${name}Targets`]: {
      get() {
        return this.targets.findAll(name);
      }
    },
    [`has${capitalize(name)}Target`]: {
      get() {
        return this.targets.has(name);
      }
    }
  };
}
function ValuePropertiesBlessing(constructor) {
  const valueDefinitionPairs = readInheritableStaticObjectPairs(constructor, "values");
  const propertyDescriptorMap = {
    valueDescriptorMap: {
      get() {
        return valueDefinitionPairs.reduce((result, valueDefinitionPair) => {
          const valueDescriptor = parseValueDefinitionPair(valueDefinitionPair, this.identifier);
          const attributeName = this.data.getAttributeNameForKey(valueDescriptor.key);
          return Object.assign(result, { [attributeName]: valueDescriptor });
        }, {});
      }
    }
  };
  return valueDefinitionPairs.reduce((properties, valueDefinitionPair) => {
    return Object.assign(properties, propertiesForValueDefinitionPair(valueDefinitionPair));
  }, propertyDescriptorMap);
}
function propertiesForValueDefinitionPair(valueDefinitionPair, controller) {
  const definition = parseValueDefinitionPair(valueDefinitionPair, controller);
  const { key, name, reader: read2, writer: write2 } = definition;
  return {
    [name]: {
      get() {
        const value = this.data.get(key);
        if (value !== null) {
          return read2(value);
        } else {
          return definition.defaultValue;
        }
      },
      set(value) {
        if (value === void 0) {
          this.data.delete(key);
        } else {
          this.data.set(key, write2(value));
        }
      }
    },
    [`has${capitalize(name)}`]: {
      get() {
        return this.data.has(key) || definition.hasCustomDefaultValue;
      }
    }
  };
}
function parseValueDefinitionPair([token, typeDefinition], controller) {
  return valueDescriptorForTokenAndTypeDefinition({
    controller,
    token,
    typeDefinition
  });
}
function parseValueTypeConstant(constant) {
  switch (constant) {
    case Array:
      return "array";
    case Boolean:
      return "boolean";
    case Number:
      return "number";
    case Object:
      return "object";
    case String:
      return "string";
  }
}
function parseValueTypeDefault(defaultValue) {
  switch (typeof defaultValue) {
    case "boolean":
      return "boolean";
    case "number":
      return "number";
    case "string":
      return "string";
  }
  if (Array.isArray(defaultValue))
    return "array";
  if (Object.prototype.toString.call(defaultValue) === "[object Object]")
    return "object";
}
function parseValueTypeObject(payload) {
  const { controller, token, typeObject } = payload;
  const hasType = isSomething(typeObject.type);
  const hasDefault = isSomething(typeObject.default);
  const fullObject = hasType && hasDefault;
  const onlyType = hasType && !hasDefault;
  const onlyDefault = !hasType && hasDefault;
  const typeFromObject = parseValueTypeConstant(typeObject.type);
  const typeFromDefaultValue = parseValueTypeDefault(payload.typeObject.default);
  if (onlyType)
    return typeFromObject;
  if (onlyDefault)
    return typeFromDefaultValue;
  if (typeFromObject !== typeFromDefaultValue) {
    const propertyPath = controller ? `${controller}.${token}` : token;
    throw new Error(`The specified default value for the Stimulus Value "${propertyPath}" must match the defined type "${typeFromObject}". The provided default value of "${typeObject.default}" is of type "${typeFromDefaultValue}".`);
  }
  if (fullObject)
    return typeFromObject;
}
function parseValueTypeDefinition(payload) {
  const { controller, token, typeDefinition } = payload;
  const typeObject = { controller, token, typeObject: typeDefinition };
  const typeFromObject = parseValueTypeObject(typeObject);
  const typeFromDefaultValue = parseValueTypeDefault(typeDefinition);
  const typeFromConstant = parseValueTypeConstant(typeDefinition);
  const type = typeFromObject || typeFromDefaultValue || typeFromConstant;
  if (type)
    return type;
  const propertyPath = controller ? `${controller}.${typeDefinition}` : token;
  throw new Error(`Unknown value type "${propertyPath}" for "${token}" value`);
}
function defaultValueForDefinition(typeDefinition) {
  const constant = parseValueTypeConstant(typeDefinition);
  if (constant)
    return defaultValuesByType[constant];
  const hasDefault = hasProperty(typeDefinition, "default");
  const hasType = hasProperty(typeDefinition, "type");
  const typeObject = typeDefinition;
  if (hasDefault)
    return typeObject.default;
  if (hasType) {
    const { type } = typeObject;
    const constantFromType = parseValueTypeConstant(type);
    if (constantFromType)
      return defaultValuesByType[constantFromType];
  }
  return typeDefinition;
}
function valueDescriptorForTokenAndTypeDefinition(payload) {
  const { token, typeDefinition } = payload;
  const key = `${dasherize(token)}-value`;
  const type = parseValueTypeDefinition(payload);
  return {
    type,
    key,
    name: camelize(key),
    get defaultValue() {
      return defaultValueForDefinition(typeDefinition);
    },
    get hasCustomDefaultValue() {
      return parseValueTypeDefault(typeDefinition) !== void 0;
    },
    reader: readers[type],
    writer: writers[type] || writers.default
  };
}
var defaultValuesByType = {
  get array() {
    return [];
  },
  boolean: false,
  number: 0,
  get object() {
    return {};
  },
  string: ""
};
var readers = {
  array(value) {
    const array = JSON.parse(value);
    if (!Array.isArray(array)) {
      throw new TypeError(`expected value of type "array" but instead got value "${value}" of type "${parseValueTypeDefault(array)}"`);
    }
    return array;
  },
  boolean(value) {
    return !(value == "0" || String(value).toLowerCase() == "false");
  },
  number(value) {
    return Number(value.replace(/_/g, ""));
  },
  object(value) {
    const object = JSON.parse(value);
    if (object === null || typeof object != "object" || Array.isArray(object)) {
      throw new TypeError(`expected value of type "object" but instead got value "${value}" of type "${parseValueTypeDefault(object)}"`);
    }
    return object;
  },
  string(value) {
    return value;
  }
};
var writers = {
  default: writeString,
  array: writeJSON,
  object: writeJSON
};
function writeJSON(value) {
  return JSON.stringify(value);
}
function writeString(value) {
  return `${value}`;
}
var Controller = class {
  constructor(context) {
    this.context = context;
  }
  static get shouldLoad() {
    return true;
  }
  static afterLoad(_identifier, _application) {
    return;
  }
  get application() {
    return this.context.application;
  }
  get scope() {
    return this.context.scope;
  }
  get element() {
    return this.scope.element;
  }
  get identifier() {
    return this.scope.identifier;
  }
  get targets() {
    return this.scope.targets;
  }
  get outlets() {
    return this.scope.outlets;
  }
  get classes() {
    return this.scope.classes;
  }
  get data() {
    return this.scope.data;
  }
  initialize() {
  }
  connect() {
  }
  disconnect() {
  }
  dispatch(eventName, { target = this.element, detail = {}, prefix = this.identifier, bubbles = true, cancelable = true } = {}) {
    const type = prefix ? `${prefix}:${eventName}` : eventName;
    const event = new CustomEvent(type, { detail, bubbles, cancelable });
    target.dispatchEvent(event);
    return event;
  }
};
Controller.blessings = [
  ClassPropertiesBlessing,
  TargetPropertiesBlessing,
  ValuePropertiesBlessing,
  OutletPropertiesBlessing
];
Controller.targets = [];
Controller.outlets = [];
Controller.values = {};

// app/javascript/controllers/application.js
var application = Application.start();
application.debug = false;
window.Stimulus = application;

// app/javascript/controllers/hello_controller.js
var hello_controller_default = class extends Controller {
  connect() {
    this.element.textContent = "Hello World!";
  }
};

// app/javascript/controllers/index.js
application.register("hello", hello_controller_default);

// node_modules/@popperjs/core/lib/index.js
var lib_exports = {};
__export(lib_exports, {
  afterMain: () => afterMain,
  afterRead: () => afterRead,
  afterWrite: () => afterWrite,
  applyStyles: () => applyStyles_default,
  arrow: () => arrow_default,
  auto: () => auto,
  basePlacements: () => basePlacements,
  beforeMain: () => beforeMain,
  beforeRead: () => beforeRead,
  beforeWrite: () => beforeWrite,
  bottom: () => bottom,
  clippingParents: () => clippingParents,
  computeStyles: () => computeStyles_default,
  createPopper: () => createPopper3,
  createPopperBase: () => createPopper,
  createPopperLite: () => createPopper2,
  detectOverflow: () => detectOverflow,
  end: () => end,
  eventListeners: () => eventListeners_default,
  flip: () => flip_default,
  hide: () => hide_default,
  left: () => left,
  main: () => main,
  modifierPhases: () => modifierPhases,
  offset: () => offset_default,
  placements: () => placements,
  popper: () => popper,
  popperGenerator: () => popperGenerator,
  popperOffsets: () => popperOffsets_default,
  preventOverflow: () => preventOverflow_default,
  read: () => read,
  reference: () => reference,
  right: () => right,
  start: () => start2,
  top: () => top,
  variationPlacements: () => variationPlacements,
  viewport: () => viewport,
  write: () => write
});

// node_modules/@popperjs/core/lib/enums.js
var top = "top";
var bottom = "bottom";
var right = "right";
var left = "left";
var auto = "auto";
var basePlacements = [top, bottom, right, left];
var start2 = "start";
var end = "end";
var clippingParents = "clippingParents";
var viewport = "viewport";
var popper = "popper";
var reference = "reference";
var variationPlacements = /* @__PURE__ */ basePlacements.reduce(function(acc, placement) {
  return acc.concat([placement + "-" + start2, placement + "-" + end]);
}, []);
var placements = /* @__PURE__ */ [].concat(basePlacements, [auto]).reduce(function(acc, placement) {
  return acc.concat([placement, placement + "-" + start2, placement + "-" + end]);
}, []);
var beforeRead = "beforeRead";
var read = "read";
var afterRead = "afterRead";
var beforeMain = "beforeMain";
var main = "main";
var afterMain = "afterMain";
var beforeWrite = "beforeWrite";
var write = "write";
var afterWrite = "afterWrite";
var modifierPhases = [beforeRead, read, afterRead, beforeMain, main, afterMain, beforeWrite, write, afterWrite];

// node_modules/@popperjs/core/lib/dom-utils/getNodeName.js
function getNodeName(element) {
  return element ? (element.nodeName || "").toLowerCase() : null;
}

// node_modules/@popperjs/core/lib/dom-utils/getWindow.js
function getWindow(node) {
  if (node == null) {
    return window;
  }
  if (node.toString() !== "[object Window]") {
    var ownerDocument = node.ownerDocument;
    return ownerDocument ? ownerDocument.defaultView || window : window;
  }
  return node;
}

// node_modules/@popperjs/core/lib/dom-utils/instanceOf.js
function isElement(node) {
  var OwnElement = getWindow(node).Element;
  return node instanceof OwnElement || node instanceof Element;
}
function isHTMLElement(node) {
  var OwnElement = getWindow(node).HTMLElement;
  return node instanceof OwnElement || node instanceof HTMLElement;
}
function isShadowRoot(node) {
  if (typeof ShadowRoot === "undefined") {
    return false;
  }
  var OwnElement = getWindow(node).ShadowRoot;
  return node instanceof OwnElement || node instanceof ShadowRoot;
}

// node_modules/@popperjs/core/lib/modifiers/applyStyles.js
function applyStyles(_ref) {
  var state = _ref.state;
  Object.keys(state.elements).forEach(function(name) {
    var style = state.styles[name] || {};
    var attributes = state.attributes[name] || {};
    var element = state.elements[name];
    if (!isHTMLElement(element) || !getNodeName(element)) {
      return;
    }
    Object.assign(element.style, style);
    Object.keys(attributes).forEach(function(name2) {
      var value = attributes[name2];
      if (value === false) {
        element.removeAttribute(name2);
      } else {
        element.setAttribute(name2, value === true ? "" : value);
      }
    });
  });
}
function effect(_ref2) {
  var state = _ref2.state;
  var initialStyles = {
    popper: {
      position: state.options.strategy,
      left: "0",
      top: "0",
      margin: "0"
    },
    arrow: {
      position: "absolute"
    },
    reference: {}
  };
  Object.assign(state.elements.popper.style, initialStyles.popper);
  state.styles = initialStyles;
  if (state.elements.arrow) {
    Object.assign(state.elements.arrow.style, initialStyles.arrow);
  }
  return function() {
    Object.keys(state.elements).forEach(function(name) {
      var element = state.elements[name];
      var attributes = state.attributes[name] || {};
      var styleProperties = Object.keys(state.styles.hasOwnProperty(name) ? state.styles[name] : initialStyles[name]);
      var style = styleProperties.reduce(function(style2, property) {
        style2[property] = "";
        return style2;
      }, {});
      if (!isHTMLElement(element) || !getNodeName(element)) {
        return;
      }
      Object.assign(element.style, style);
      Object.keys(attributes).forEach(function(attribute) {
        element.removeAttribute(attribute);
      });
    });
  };
}
var applyStyles_default = {
  name: "applyStyles",
  enabled: true,
  phase: "write",
  fn: applyStyles,
  effect,
  requires: ["computeStyles"]
};

// node_modules/@popperjs/core/lib/utils/getBasePlacement.js
function getBasePlacement(placement) {
  return placement.split("-")[0];
}

// node_modules/@popperjs/core/lib/utils/math.js
var max = Math.max;
var min = Math.min;
var round = Math.round;

// node_modules/@popperjs/core/lib/utils/userAgent.js
function getUAString() {
  var uaData = navigator.userAgentData;
  if (uaData != null && uaData.brands && Array.isArray(uaData.brands)) {
    return uaData.brands.map(function(item) {
      return item.brand + "/" + item.version;
    }).join(" ");
  }
  return navigator.userAgent;
}

// node_modules/@popperjs/core/lib/dom-utils/isLayoutViewport.js
function isLayoutViewport() {
  return !/^((?!chrome|android).)*safari/i.test(getUAString());
}

// node_modules/@popperjs/core/lib/dom-utils/getBoundingClientRect.js
function getBoundingClientRect(element, includeScale, isFixedStrategy) {
  if (includeScale === void 0) {
    includeScale = false;
  }
  if (isFixedStrategy === void 0) {
    isFixedStrategy = false;
  }
  var clientRect = element.getBoundingClientRect();
  var scaleX = 1;
  var scaleY = 1;
  if (includeScale && isHTMLElement(element)) {
    scaleX = element.offsetWidth > 0 ? round(clientRect.width) / element.offsetWidth || 1 : 1;
    scaleY = element.offsetHeight > 0 ? round(clientRect.height) / element.offsetHeight || 1 : 1;
  }
  var _ref = isElement(element) ? getWindow(element) : window, visualViewport = _ref.visualViewport;
  var addVisualOffsets = !isLayoutViewport() && isFixedStrategy;
  var x2 = (clientRect.left + (addVisualOffsets && visualViewport ? visualViewport.offsetLeft : 0)) / scaleX;
  var y2 = (clientRect.top + (addVisualOffsets && visualViewport ? visualViewport.offsetTop : 0)) / scaleY;
  var width = clientRect.width / scaleX;
  var height = clientRect.height / scaleY;
  return {
    width,
    height,
    top: y2,
    right: x2 + width,
    bottom: y2 + height,
    left: x2,
    x: x2,
    y: y2
  };
}

// node_modules/@popperjs/core/lib/dom-utils/getLayoutRect.js
function getLayoutRect(element) {
  var clientRect = getBoundingClientRect(element);
  var width = element.offsetWidth;
  var height = element.offsetHeight;
  if (Math.abs(clientRect.width - width) <= 1) {
    width = clientRect.width;
  }
  if (Math.abs(clientRect.height - height) <= 1) {
    height = clientRect.height;
  }
  return {
    x: element.offsetLeft,
    y: element.offsetTop,
    width,
    height
  };
}

// node_modules/@popperjs/core/lib/dom-utils/contains.js
function contains(parent, child) {
  var rootNode = child.getRootNode && child.getRootNode();
  if (parent.contains(child)) {
    return true;
  } else if (rootNode && isShadowRoot(rootNode)) {
    var next = child;
    do {
      if (next && parent.isSameNode(next)) {
        return true;
      }
      next = next.parentNode || next.host;
    } while (next);
  }
  return false;
}

// node_modules/@popperjs/core/lib/dom-utils/getComputedStyle.js
function getComputedStyle2(element) {
  return getWindow(element).getComputedStyle(element);
}

// node_modules/@popperjs/core/lib/dom-utils/isTableElement.js
function isTableElement(element) {
  return ["table", "td", "th"].indexOf(getNodeName(element)) >= 0;
}

// node_modules/@popperjs/core/lib/dom-utils/getDocumentElement.js
function getDocumentElement(element) {
  return ((isElement(element) ? element.ownerDocument : (
    // $FlowFixMe[prop-missing]
    element.document
  )) || window.document).documentElement;
}

// node_modules/@popperjs/core/lib/dom-utils/getParentNode.js
function getParentNode(element) {
  if (getNodeName(element) === "html") {
    return element;
  }
  return (
    // this is a quicker (but less type safe) way to save quite some bytes from the bundle
    // $FlowFixMe[incompatible-return]
    // $FlowFixMe[prop-missing]
    element.assignedSlot || // step into the shadow DOM of the parent of a slotted node
    element.parentNode || // DOM Element detected
    (isShadowRoot(element) ? element.host : null) || // ShadowRoot detected
    // $FlowFixMe[incompatible-call]: HTMLElement is a Node
    getDocumentElement(element)
  );
}

// node_modules/@popperjs/core/lib/dom-utils/getOffsetParent.js
function getTrueOffsetParent(element) {
  if (!isHTMLElement(element) || // https://github.com/popperjs/popper-core/issues/837
  getComputedStyle2(element).position === "fixed") {
    return null;
  }
  return element.offsetParent;
}
function getContainingBlock(element) {
  var isFirefox = /firefox/i.test(getUAString());
  var isIE = /Trident/i.test(getUAString());
  if (isIE && isHTMLElement(element)) {
    var elementCss = getComputedStyle2(element);
    if (elementCss.position === "fixed") {
      return null;
    }
  }
  var currentNode = getParentNode(element);
  if (isShadowRoot(currentNode)) {
    currentNode = currentNode.host;
  }
  while (isHTMLElement(currentNode) && ["html", "body"].indexOf(getNodeName(currentNode)) < 0) {
    var css = getComputedStyle2(currentNode);
    if (css.transform !== "none" || css.perspective !== "none" || css.contain === "paint" || ["transform", "perspective"].indexOf(css.willChange) !== -1 || isFirefox && css.willChange === "filter" || isFirefox && css.filter && css.filter !== "none") {
      return currentNode;
    } else {
      currentNode = currentNode.parentNode;
    }
  }
  return null;
}
function getOffsetParent(element) {
  var window2 = getWindow(element);
  var offsetParent = getTrueOffsetParent(element);
  while (offsetParent && isTableElement(offsetParent) && getComputedStyle2(offsetParent).position === "static") {
    offsetParent = getTrueOffsetParent(offsetParent);
  }
  if (offsetParent && (getNodeName(offsetParent) === "html" || getNodeName(offsetParent) === "body" && getComputedStyle2(offsetParent).position === "static")) {
    return window2;
  }
  return offsetParent || getContainingBlock(element) || window2;
}

// node_modules/@popperjs/core/lib/utils/getMainAxisFromPlacement.js
function getMainAxisFromPlacement(placement) {
  return ["top", "bottom"].indexOf(placement) >= 0 ? "x" : "y";
}

// node_modules/@popperjs/core/lib/utils/within.js
function within(min2, value, max2) {
  return max(min2, min(value, max2));
}
function withinMaxClamp(min2, value, max2) {
  var v2 = within(min2, value, max2);
  return v2 > max2 ? max2 : v2;
}

// node_modules/@popperjs/core/lib/utils/getFreshSideObject.js
function getFreshSideObject() {
  return {
    top: 0,
    right: 0,
    bottom: 0,
    left: 0
  };
}

// node_modules/@popperjs/core/lib/utils/mergePaddingObject.js
function mergePaddingObject(paddingObject) {
  return Object.assign({}, getFreshSideObject(), paddingObject);
}

// node_modules/@popperjs/core/lib/utils/expandToHashMap.js
function expandToHashMap(value, keys) {
  return keys.reduce(function(hashMap, key) {
    hashMap[key] = value;
    return hashMap;
  }, {});
}

// node_modules/@popperjs/core/lib/modifiers/arrow.js
var toPaddingObject = function toPaddingObject2(padding, state) {
  padding = typeof padding === "function" ? padding(Object.assign({}, state.rects, {
    placement: state.placement
  })) : padding;
  return mergePaddingObject(typeof padding !== "number" ? padding : expandToHashMap(padding, basePlacements));
};
function arrow(_ref) {
  var _state$modifiersData$;
  var state = _ref.state, name = _ref.name, options = _ref.options;
  var arrowElement = state.elements.arrow;
  var popperOffsets2 = state.modifiersData.popperOffsets;
  var basePlacement = getBasePlacement(state.placement);
  var axis = getMainAxisFromPlacement(basePlacement);
  var isVertical = [left, right].indexOf(basePlacement) >= 0;
  var len = isVertical ? "height" : "width";
  if (!arrowElement || !popperOffsets2) {
    return;
  }
  var paddingObject = toPaddingObject(options.padding, state);
  var arrowRect = getLayoutRect(arrowElement);
  var minProp = axis === "y" ? top : left;
  var maxProp = axis === "y" ? bottom : right;
  var endDiff = state.rects.reference[len] + state.rects.reference[axis] - popperOffsets2[axis] - state.rects.popper[len];
  var startDiff = popperOffsets2[axis] - state.rects.reference[axis];
  var arrowOffsetParent = getOffsetParent(arrowElement);
  var clientSize = arrowOffsetParent ? axis === "y" ? arrowOffsetParent.clientHeight || 0 : arrowOffsetParent.clientWidth || 0 : 0;
  var centerToReference = endDiff / 2 - startDiff / 2;
  var min2 = paddingObject[minProp];
  var max2 = clientSize - arrowRect[len] - paddingObject[maxProp];
  var center = clientSize / 2 - arrowRect[len] / 2 + centerToReference;
  var offset2 = within(min2, center, max2);
  var axisProp = axis;
  state.modifiersData[name] = (_state$modifiersData$ = {}, _state$modifiersData$[axisProp] = offset2, _state$modifiersData$.centerOffset = offset2 - center, _state$modifiersData$);
}
function effect2(_ref2) {
  var state = _ref2.state, options = _ref2.options;
  var _options$element = options.element, arrowElement = _options$element === void 0 ? "[data-popper-arrow]" : _options$element;
  if (arrowElement == null) {
    return;
  }
  if (typeof arrowElement === "string") {
    arrowElement = state.elements.popper.querySelector(arrowElement);
    if (!arrowElement) {
      return;
    }
  }
  if (!contains(state.elements.popper, arrowElement)) {
    return;
  }
  state.elements.arrow = arrowElement;
}
var arrow_default = {
  name: "arrow",
  enabled: true,
  phase: "main",
  fn: arrow,
  effect: effect2,
  requires: ["popperOffsets"],
  requiresIfExists: ["preventOverflow"]
};

// node_modules/@popperjs/core/lib/utils/getVariation.js
function getVariation(placement) {
  return placement.split("-")[1];
}

// node_modules/@popperjs/core/lib/modifiers/computeStyles.js
var unsetSides = {
  top: "auto",
  right: "auto",
  bottom: "auto",
  left: "auto"
};
function roundOffsetsByDPR(_ref, win) {
  var x2 = _ref.x, y2 = _ref.y;
  var dpr = win.devicePixelRatio || 1;
  return {
    x: round(x2 * dpr) / dpr || 0,
    y: round(y2 * dpr) / dpr || 0
  };
}
function mapToStyles(_ref2) {
  var _Object$assign2;
  var popper2 = _ref2.popper, popperRect = _ref2.popperRect, placement = _ref2.placement, variation = _ref2.variation, offsets = _ref2.offsets, position = _ref2.position, gpuAcceleration = _ref2.gpuAcceleration, adaptive = _ref2.adaptive, roundOffsets = _ref2.roundOffsets, isFixed = _ref2.isFixed;
  var _offsets$x = offsets.x, x2 = _offsets$x === void 0 ? 0 : _offsets$x, _offsets$y = offsets.y, y2 = _offsets$y === void 0 ? 0 : _offsets$y;
  var _ref3 = typeof roundOffsets === "function" ? roundOffsets({
    x: x2,
    y: y2
  }) : {
    x: x2,
    y: y2
  };
  x2 = _ref3.x;
  y2 = _ref3.y;
  var hasX = offsets.hasOwnProperty("x");
  var hasY = offsets.hasOwnProperty("y");
  var sideX = left;
  var sideY = top;
  var win = window;
  if (adaptive) {
    var offsetParent = getOffsetParent(popper2);
    var heightProp = "clientHeight";
    var widthProp = "clientWidth";
    if (offsetParent === getWindow(popper2)) {
      offsetParent = getDocumentElement(popper2);
      if (getComputedStyle2(offsetParent).position !== "static" && position === "absolute") {
        heightProp = "scrollHeight";
        widthProp = "scrollWidth";
      }
    }
    offsetParent = offsetParent;
    if (placement === top || (placement === left || placement === right) && variation === end) {
      sideY = bottom;
      var offsetY = isFixed && offsetParent === win && win.visualViewport ? win.visualViewport.height : (
        // $FlowFixMe[prop-missing]
        offsetParent[heightProp]
      );
      y2 -= offsetY - popperRect.height;
      y2 *= gpuAcceleration ? 1 : -1;
    }
    if (placement === left || (placement === top || placement === bottom) && variation === end) {
      sideX = right;
      var offsetX = isFixed && offsetParent === win && win.visualViewport ? win.visualViewport.width : (
        // $FlowFixMe[prop-missing]
        offsetParent[widthProp]
      );
      x2 -= offsetX - popperRect.width;
      x2 *= gpuAcceleration ? 1 : -1;
    }
  }
  var commonStyles = Object.assign({
    position
  }, adaptive && unsetSides);
  var _ref4 = roundOffsets === true ? roundOffsetsByDPR({
    x: x2,
    y: y2
  }, getWindow(popper2)) : {
    x: x2,
    y: y2
  };
  x2 = _ref4.x;
  y2 = _ref4.y;
  if (gpuAcceleration) {
    var _Object$assign;
    return Object.assign({}, commonStyles, (_Object$assign = {}, _Object$assign[sideY] = hasY ? "0" : "", _Object$assign[sideX] = hasX ? "0" : "", _Object$assign.transform = (win.devicePixelRatio || 1) <= 1 ? "translate(" + x2 + "px, " + y2 + "px)" : "translate3d(" + x2 + "px, " + y2 + "px, 0)", _Object$assign));
  }
  return Object.assign({}, commonStyles, (_Object$assign2 = {}, _Object$assign2[sideY] = hasY ? y2 + "px" : "", _Object$assign2[sideX] = hasX ? x2 + "px" : "", _Object$assign2.transform = "", _Object$assign2));
}
function computeStyles(_ref5) {
  var state = _ref5.state, options = _ref5.options;
  var _options$gpuAccelerat = options.gpuAcceleration, gpuAcceleration = _options$gpuAccelerat === void 0 ? true : _options$gpuAccelerat, _options$adaptive = options.adaptive, adaptive = _options$adaptive === void 0 ? true : _options$adaptive, _options$roundOffsets = options.roundOffsets, roundOffsets = _options$roundOffsets === void 0 ? true : _options$roundOffsets;
  var commonStyles = {
    placement: getBasePlacement(state.placement),
    variation: getVariation(state.placement),
    popper: state.elements.popper,
    popperRect: state.rects.popper,
    gpuAcceleration,
    isFixed: state.options.strategy === "fixed"
  };
  if (state.modifiersData.popperOffsets != null) {
    state.styles.popper = Object.assign({}, state.styles.popper, mapToStyles(Object.assign({}, commonStyles, {
      offsets: state.modifiersData.popperOffsets,
      position: state.options.strategy,
      adaptive,
      roundOffsets
    })));
  }
  if (state.modifiersData.arrow != null) {
    state.styles.arrow = Object.assign({}, state.styles.arrow, mapToStyles(Object.assign({}, commonStyles, {
      offsets: state.modifiersData.arrow,
      position: "absolute",
      adaptive: false,
      roundOffsets
    })));
  }
  state.attributes.popper = Object.assign({}, state.attributes.popper, {
    "data-popper-placement": state.placement
  });
}
var computeStyles_default = {
  name: "computeStyles",
  enabled: true,
  phase: "beforeWrite",
  fn: computeStyles,
  data: {}
};

// node_modules/@popperjs/core/lib/modifiers/eventListeners.js
var passive = {
  passive: true
};
function effect3(_ref) {
  var state = _ref.state, instance = _ref.instance, options = _ref.options;
  var _options$scroll = options.scroll, scroll = _options$scroll === void 0 ? true : _options$scroll, _options$resize = options.resize, resize = _options$resize === void 0 ? true : _options$resize;
  var window2 = getWindow(state.elements.popper);
  var scrollParents = [].concat(state.scrollParents.reference, state.scrollParents.popper);
  if (scroll) {
    scrollParents.forEach(function(scrollParent) {
      scrollParent.addEventListener("scroll", instance.update, passive);
    });
  }
  if (resize) {
    window2.addEventListener("resize", instance.update, passive);
  }
  return function() {
    if (scroll) {
      scrollParents.forEach(function(scrollParent) {
        scrollParent.removeEventListener("scroll", instance.update, passive);
      });
    }
    if (resize) {
      window2.removeEventListener("resize", instance.update, passive);
    }
  };
}
var eventListeners_default = {
  name: "eventListeners",
  enabled: true,
  phase: "write",
  fn: function fn() {
  },
  effect: effect3,
  data: {}
};

// node_modules/@popperjs/core/lib/utils/getOppositePlacement.js
var hash = {
  left: "right",
  right: "left",
  bottom: "top",
  top: "bottom"
};
function getOppositePlacement(placement) {
  return placement.replace(/left|right|bottom|top/g, function(matched) {
    return hash[matched];
  });
}

// node_modules/@popperjs/core/lib/utils/getOppositeVariationPlacement.js
var hash2 = {
  start: "end",
  end: "start"
};
function getOppositeVariationPlacement(placement) {
  return placement.replace(/start|end/g, function(matched) {
    return hash2[matched];
  });
}

// node_modules/@popperjs/core/lib/dom-utils/getWindowScroll.js
function getWindowScroll(node) {
  var win = getWindow(node);
  var scrollLeft = win.pageXOffset;
  var scrollTop = win.pageYOffset;
  return {
    scrollLeft,
    scrollTop
  };
}

// node_modules/@popperjs/core/lib/dom-utils/getWindowScrollBarX.js
function getWindowScrollBarX(element) {
  return getBoundingClientRect(getDocumentElement(element)).left + getWindowScroll(element).scrollLeft;
}

// node_modules/@popperjs/core/lib/dom-utils/getViewportRect.js
function getViewportRect(element, strategy) {
  var win = getWindow(element);
  var html = getDocumentElement(element);
  var visualViewport = win.visualViewport;
  var width = html.clientWidth;
  var height = html.clientHeight;
  var x2 = 0;
  var y2 = 0;
  if (visualViewport) {
    width = visualViewport.width;
    height = visualViewport.height;
    var layoutViewport = isLayoutViewport();
    if (layoutViewport || !layoutViewport && strategy === "fixed") {
      x2 = visualViewport.offsetLeft;
      y2 = visualViewport.offsetTop;
    }
  }
  return {
    width,
    height,
    x: x2 + getWindowScrollBarX(element),
    y: y2
  };
}

// node_modules/@popperjs/core/lib/dom-utils/getDocumentRect.js
function getDocumentRect(element) {
  var _element$ownerDocumen;
  var html = getDocumentElement(element);
  var winScroll = getWindowScroll(element);
  var body = (_element$ownerDocumen = element.ownerDocument) == null ? void 0 : _element$ownerDocumen.body;
  var width = max(html.scrollWidth, html.clientWidth, body ? body.scrollWidth : 0, body ? body.clientWidth : 0);
  var height = max(html.scrollHeight, html.clientHeight, body ? body.scrollHeight : 0, body ? body.clientHeight : 0);
  var x2 = -winScroll.scrollLeft + getWindowScrollBarX(element);
  var y2 = -winScroll.scrollTop;
  if (getComputedStyle2(body || html).direction === "rtl") {
    x2 += max(html.clientWidth, body ? body.clientWidth : 0) - width;
  }
  return {
    width,
    height,
    x: x2,
    y: y2
  };
}

// node_modules/@popperjs/core/lib/dom-utils/isScrollParent.js
function isScrollParent(element) {
  var _getComputedStyle = getComputedStyle2(element), overflow = _getComputedStyle.overflow, overflowX = _getComputedStyle.overflowX, overflowY = _getComputedStyle.overflowY;
  return /auto|scroll|overlay|hidden/.test(overflow + overflowY + overflowX);
}

// node_modules/@popperjs/core/lib/dom-utils/getScrollParent.js
function getScrollParent(node) {
  if (["html", "body", "#document"].indexOf(getNodeName(node)) >= 0) {
    return node.ownerDocument.body;
  }
  if (isHTMLElement(node) && isScrollParent(node)) {
    return node;
  }
  return getScrollParent(getParentNode(node));
}

// node_modules/@popperjs/core/lib/dom-utils/listScrollParents.js
function listScrollParents(element, list) {
  var _element$ownerDocumen;
  if (list === void 0) {
    list = [];
  }
  var scrollParent = getScrollParent(element);
  var isBody = scrollParent === ((_element$ownerDocumen = element.ownerDocument) == null ? void 0 : _element$ownerDocumen.body);
  var win = getWindow(scrollParent);
  var target = isBody ? [win].concat(win.visualViewport || [], isScrollParent(scrollParent) ? scrollParent : []) : scrollParent;
  var updatedList = list.concat(target);
  return isBody ? updatedList : (
    // $FlowFixMe[incompatible-call]: isBody tells us target will be an HTMLElement here
    updatedList.concat(listScrollParents(getParentNode(target)))
  );
}

// node_modules/@popperjs/core/lib/utils/rectToClientRect.js
function rectToClientRect(rect) {
  return Object.assign({}, rect, {
    left: rect.x,
    top: rect.y,
    right: rect.x + rect.width,
    bottom: rect.y + rect.height
  });
}

// node_modules/@popperjs/core/lib/dom-utils/getClippingRect.js
function getInnerBoundingClientRect(element, strategy) {
  var rect = getBoundingClientRect(element, false, strategy === "fixed");
  rect.top = rect.top + element.clientTop;
  rect.left = rect.left + element.clientLeft;
  rect.bottom = rect.top + element.clientHeight;
  rect.right = rect.left + element.clientWidth;
  rect.width = element.clientWidth;
  rect.height = element.clientHeight;
  rect.x = rect.left;
  rect.y = rect.top;
  return rect;
}
function getClientRectFromMixedType(element, clippingParent, strategy) {
  return clippingParent === viewport ? rectToClientRect(getViewportRect(element, strategy)) : isElement(clippingParent) ? getInnerBoundingClientRect(clippingParent, strategy) : rectToClientRect(getDocumentRect(getDocumentElement(element)));
}
function getClippingParents(element) {
  var clippingParents2 = listScrollParents(getParentNode(element));
  var canEscapeClipping = ["absolute", "fixed"].indexOf(getComputedStyle2(element).position) >= 0;
  var clipperElement = canEscapeClipping && isHTMLElement(element) ? getOffsetParent(element) : element;
  if (!isElement(clipperElement)) {
    return [];
  }
  return clippingParents2.filter(function(clippingParent) {
    return isElement(clippingParent) && contains(clippingParent, clipperElement) && getNodeName(clippingParent) !== "body";
  });
}
function getClippingRect(element, boundary, rootBoundary, strategy) {
  var mainClippingParents = boundary === "clippingParents" ? getClippingParents(element) : [].concat(boundary);
  var clippingParents2 = [].concat(mainClippingParents, [rootBoundary]);
  var firstClippingParent = clippingParents2[0];
  var clippingRect = clippingParents2.reduce(function(accRect, clippingParent) {
    var rect = getClientRectFromMixedType(element, clippingParent, strategy);
    accRect.top = max(rect.top, accRect.top);
    accRect.right = min(rect.right, accRect.right);
    accRect.bottom = min(rect.bottom, accRect.bottom);
    accRect.left = max(rect.left, accRect.left);
    return accRect;
  }, getClientRectFromMixedType(element, firstClippingParent, strategy));
  clippingRect.width = clippingRect.right - clippingRect.left;
  clippingRect.height = clippingRect.bottom - clippingRect.top;
  clippingRect.x = clippingRect.left;
  clippingRect.y = clippingRect.top;
  return clippingRect;
}

// node_modules/@popperjs/core/lib/utils/computeOffsets.js
function computeOffsets(_ref) {
  var reference2 = _ref.reference, element = _ref.element, placement = _ref.placement;
  var basePlacement = placement ? getBasePlacement(placement) : null;
  var variation = placement ? getVariation(placement) : null;
  var commonX = reference2.x + reference2.width / 2 - element.width / 2;
  var commonY = reference2.y + reference2.height / 2 - element.height / 2;
  var offsets;
  switch (basePlacement) {
    case top:
      offsets = {
        x: commonX,
        y: reference2.y - element.height
      };
      break;
    case bottom:
      offsets = {
        x: commonX,
        y: reference2.y + reference2.height
      };
      break;
    case right:
      offsets = {
        x: reference2.x + reference2.width,
        y: commonY
      };
      break;
    case left:
      offsets = {
        x: reference2.x - element.width,
        y: commonY
      };
      break;
    default:
      offsets = {
        x: reference2.x,
        y: reference2.y
      };
  }
  var mainAxis = basePlacement ? getMainAxisFromPlacement(basePlacement) : null;
  if (mainAxis != null) {
    var len = mainAxis === "y" ? "height" : "width";
    switch (variation) {
      case start2:
        offsets[mainAxis] = offsets[mainAxis] - (reference2[len] / 2 - element[len] / 2);
        break;
      case end:
        offsets[mainAxis] = offsets[mainAxis] + (reference2[len] / 2 - element[len] / 2);
        break;
      default:
    }
  }
  return offsets;
}

// node_modules/@popperjs/core/lib/utils/detectOverflow.js
function detectOverflow(state, options) {
  if (options === void 0) {
    options = {};
  }
  var _options = options, _options$placement = _options.placement, placement = _options$placement === void 0 ? state.placement : _options$placement, _options$strategy = _options.strategy, strategy = _options$strategy === void 0 ? state.strategy : _options$strategy, _options$boundary = _options.boundary, boundary = _options$boundary === void 0 ? clippingParents : _options$boundary, _options$rootBoundary = _options.rootBoundary, rootBoundary = _options$rootBoundary === void 0 ? viewport : _options$rootBoundary, _options$elementConte = _options.elementContext, elementContext = _options$elementConte === void 0 ? popper : _options$elementConte, _options$altBoundary = _options.altBoundary, altBoundary = _options$altBoundary === void 0 ? false : _options$altBoundary, _options$padding = _options.padding, padding = _options$padding === void 0 ? 0 : _options$padding;
  var paddingObject = mergePaddingObject(typeof padding !== "number" ? padding : expandToHashMap(padding, basePlacements));
  var altContext = elementContext === popper ? reference : popper;
  var popperRect = state.rects.popper;
  var element = state.elements[altBoundary ? altContext : elementContext];
  var clippingClientRect = getClippingRect(isElement(element) ? element : element.contextElement || getDocumentElement(state.elements.popper), boundary, rootBoundary, strategy);
  var referenceClientRect = getBoundingClientRect(state.elements.reference);
  var popperOffsets2 = computeOffsets({
    reference: referenceClientRect,
    element: popperRect,
    strategy: "absolute",
    placement
  });
  var popperClientRect = rectToClientRect(Object.assign({}, popperRect, popperOffsets2));
  var elementClientRect = elementContext === popper ? popperClientRect : referenceClientRect;
  var overflowOffsets = {
    top: clippingClientRect.top - elementClientRect.top + paddingObject.top,
    bottom: elementClientRect.bottom - clippingClientRect.bottom + paddingObject.bottom,
    left: clippingClientRect.left - elementClientRect.left + paddingObject.left,
    right: elementClientRect.right - clippingClientRect.right + paddingObject.right
  };
  var offsetData = state.modifiersData.offset;
  if (elementContext === popper && offsetData) {
    var offset2 = offsetData[placement];
    Object.keys(overflowOffsets).forEach(function(key) {
      var multiply = [right, bottom].indexOf(key) >= 0 ? 1 : -1;
      var axis = [top, bottom].indexOf(key) >= 0 ? "y" : "x";
      overflowOffsets[key] += offset2[axis] * multiply;
    });
  }
  return overflowOffsets;
}

// node_modules/@popperjs/core/lib/utils/computeAutoPlacement.js
function computeAutoPlacement(state, options) {
  if (options === void 0) {
    options = {};
  }
  var _options = options, placement = _options.placement, boundary = _options.boundary, rootBoundary = _options.rootBoundary, padding = _options.padding, flipVariations = _options.flipVariations, _options$allowedAutoP = _options.allowedAutoPlacements, allowedAutoPlacements = _options$allowedAutoP === void 0 ? placements : _options$allowedAutoP;
  var variation = getVariation(placement);
  var placements2 = variation ? flipVariations ? variationPlacements : variationPlacements.filter(function(placement2) {
    return getVariation(placement2) === variation;
  }) : basePlacements;
  var allowedPlacements = placements2.filter(function(placement2) {
    return allowedAutoPlacements.indexOf(placement2) >= 0;
  });
  if (allowedPlacements.length === 0) {
    allowedPlacements = placements2;
  }
  var overflows = allowedPlacements.reduce(function(acc, placement2) {
    acc[placement2] = detectOverflow(state, {
      placement: placement2,
      boundary,
      rootBoundary,
      padding
    })[getBasePlacement(placement2)];
    return acc;
  }, {});
  return Object.keys(overflows).sort(function(a2, b2) {
    return overflows[a2] - overflows[b2];
  });
}

// node_modules/@popperjs/core/lib/modifiers/flip.js
function getExpandedFallbackPlacements(placement) {
  if (getBasePlacement(placement) === auto) {
    return [];
  }
  var oppositePlacement = getOppositePlacement(placement);
  return [getOppositeVariationPlacement(placement), oppositePlacement, getOppositeVariationPlacement(oppositePlacement)];
}
function flip(_ref) {
  var state = _ref.state, options = _ref.options, name = _ref.name;
  if (state.modifiersData[name]._skip) {
    return;
  }
  var _options$mainAxis = options.mainAxis, checkMainAxis = _options$mainAxis === void 0 ? true : _options$mainAxis, _options$altAxis = options.altAxis, checkAltAxis = _options$altAxis === void 0 ? true : _options$altAxis, specifiedFallbackPlacements = options.fallbackPlacements, padding = options.padding, boundary = options.boundary, rootBoundary = options.rootBoundary, altBoundary = options.altBoundary, _options$flipVariatio = options.flipVariations, flipVariations = _options$flipVariatio === void 0 ? true : _options$flipVariatio, allowedAutoPlacements = options.allowedAutoPlacements;
  var preferredPlacement = state.options.placement;
  var basePlacement = getBasePlacement(preferredPlacement);
  var isBasePlacement = basePlacement === preferredPlacement;
  var fallbackPlacements = specifiedFallbackPlacements || (isBasePlacement || !flipVariations ? [getOppositePlacement(preferredPlacement)] : getExpandedFallbackPlacements(preferredPlacement));
  var placements2 = [preferredPlacement].concat(fallbackPlacements).reduce(function(acc, placement2) {
    return acc.concat(getBasePlacement(placement2) === auto ? computeAutoPlacement(state, {
      placement: placement2,
      boundary,
      rootBoundary,
      padding,
      flipVariations,
      allowedAutoPlacements
    }) : placement2);
  }, []);
  var referenceRect = state.rects.reference;
  var popperRect = state.rects.popper;
  var checksMap = /* @__PURE__ */ new Map();
  var makeFallbackChecks = true;
  var firstFittingPlacement = placements2[0];
  for (var i2 = 0; i2 < placements2.length; i2++) {
    var placement = placements2[i2];
    var _basePlacement = getBasePlacement(placement);
    var isStartVariation = getVariation(placement) === start2;
    var isVertical = [top, bottom].indexOf(_basePlacement) >= 0;
    var len = isVertical ? "width" : "height";
    var overflow = detectOverflow(state, {
      placement,
      boundary,
      rootBoundary,
      altBoundary,
      padding
    });
    var mainVariationSide = isVertical ? isStartVariation ? right : left : isStartVariation ? bottom : top;
    if (referenceRect[len] > popperRect[len]) {
      mainVariationSide = getOppositePlacement(mainVariationSide);
    }
    var altVariationSide = getOppositePlacement(mainVariationSide);
    var checks = [];
    if (checkMainAxis) {
      checks.push(overflow[_basePlacement] <= 0);
    }
    if (checkAltAxis) {
      checks.push(overflow[mainVariationSide] <= 0, overflow[altVariationSide] <= 0);
    }
    if (checks.every(function(check) {
      return check;
    })) {
      firstFittingPlacement = placement;
      makeFallbackChecks = false;
      break;
    }
    checksMap.set(placement, checks);
  }
  if (makeFallbackChecks) {
    var numberOfChecks = flipVariations ? 3 : 1;
    var _loop = function _loop2(_i3) {
      var fittingPlacement = placements2.find(function(placement2) {
        var checks2 = checksMap.get(placement2);
        if (checks2) {
          return checks2.slice(0, _i3).every(function(check) {
            return check;
          });
        }
      });
      if (fittingPlacement) {
        firstFittingPlacement = fittingPlacement;
        return "break";
      }
    };
    for (var _i2 = numberOfChecks; _i2 > 0; _i2--) {
      var _ret = _loop(_i2);
      if (_ret === "break") break;
    }
  }
  if (state.placement !== firstFittingPlacement) {
    state.modifiersData[name]._skip = true;
    state.placement = firstFittingPlacement;
    state.reset = true;
  }
}
var flip_default = {
  name: "flip",
  enabled: true,
  phase: "main",
  fn: flip,
  requiresIfExists: ["offset"],
  data: {
    _skip: false
  }
};

// node_modules/@popperjs/core/lib/modifiers/hide.js
function getSideOffsets(overflow, rect, preventedOffsets) {
  if (preventedOffsets === void 0) {
    preventedOffsets = {
      x: 0,
      y: 0
    };
  }
  return {
    top: overflow.top - rect.height - preventedOffsets.y,
    right: overflow.right - rect.width + preventedOffsets.x,
    bottom: overflow.bottom - rect.height + preventedOffsets.y,
    left: overflow.left - rect.width - preventedOffsets.x
  };
}
function isAnySideFullyClipped(overflow) {
  return [top, right, bottom, left].some(function(side) {
    return overflow[side] >= 0;
  });
}
function hide(_ref) {
  var state = _ref.state, name = _ref.name;
  var referenceRect = state.rects.reference;
  var popperRect = state.rects.popper;
  var preventedOffsets = state.modifiersData.preventOverflow;
  var referenceOverflow = detectOverflow(state, {
    elementContext: "reference"
  });
  var popperAltOverflow = detectOverflow(state, {
    altBoundary: true
  });
  var referenceClippingOffsets = getSideOffsets(referenceOverflow, referenceRect);
  var popperEscapeOffsets = getSideOffsets(popperAltOverflow, popperRect, preventedOffsets);
  var isReferenceHidden = isAnySideFullyClipped(referenceClippingOffsets);
  var hasPopperEscaped = isAnySideFullyClipped(popperEscapeOffsets);
  state.modifiersData[name] = {
    referenceClippingOffsets,
    popperEscapeOffsets,
    isReferenceHidden,
    hasPopperEscaped
  };
  state.attributes.popper = Object.assign({}, state.attributes.popper, {
    "data-popper-reference-hidden": isReferenceHidden,
    "data-popper-escaped": hasPopperEscaped
  });
}
var hide_default = {
  name: "hide",
  enabled: true,
  phase: "main",
  requiresIfExists: ["preventOverflow"],
  fn: hide
};

// node_modules/@popperjs/core/lib/modifiers/offset.js
function distanceAndSkiddingToXY(placement, rects, offset2) {
  var basePlacement = getBasePlacement(placement);
  var invertDistance = [left, top].indexOf(basePlacement) >= 0 ? -1 : 1;
  var _ref = typeof offset2 === "function" ? offset2(Object.assign({}, rects, {
    placement
  })) : offset2, skidding = _ref[0], distance = _ref[1];
  skidding = skidding || 0;
  distance = (distance || 0) * invertDistance;
  return [left, right].indexOf(basePlacement) >= 0 ? {
    x: distance,
    y: skidding
  } : {
    x: skidding,
    y: distance
  };
}
function offset(_ref2) {
  var state = _ref2.state, options = _ref2.options, name = _ref2.name;
  var _options$offset = options.offset, offset2 = _options$offset === void 0 ? [0, 0] : _options$offset;
  var data = placements.reduce(function(acc, placement) {
    acc[placement] = distanceAndSkiddingToXY(placement, state.rects, offset2);
    return acc;
  }, {});
  var _data$state$placement = data[state.placement], x2 = _data$state$placement.x, y2 = _data$state$placement.y;
  if (state.modifiersData.popperOffsets != null) {
    state.modifiersData.popperOffsets.x += x2;
    state.modifiersData.popperOffsets.y += y2;
  }
  state.modifiersData[name] = data;
}
var offset_default = {
  name: "offset",
  enabled: true,
  phase: "main",
  requires: ["popperOffsets"],
  fn: offset
};

// node_modules/@popperjs/core/lib/modifiers/popperOffsets.js
function popperOffsets(_ref) {
  var state = _ref.state, name = _ref.name;
  state.modifiersData[name] = computeOffsets({
    reference: state.rects.reference,
    element: state.rects.popper,
    strategy: "absolute",
    placement: state.placement
  });
}
var popperOffsets_default = {
  name: "popperOffsets",
  enabled: true,
  phase: "read",
  fn: popperOffsets,
  data: {}
};

// node_modules/@popperjs/core/lib/utils/getAltAxis.js
function getAltAxis(axis) {
  return axis === "x" ? "y" : "x";
}

// node_modules/@popperjs/core/lib/modifiers/preventOverflow.js
function preventOverflow(_ref) {
  var state = _ref.state, options = _ref.options, name = _ref.name;
  var _options$mainAxis = options.mainAxis, checkMainAxis = _options$mainAxis === void 0 ? true : _options$mainAxis, _options$altAxis = options.altAxis, checkAltAxis = _options$altAxis === void 0 ? false : _options$altAxis, boundary = options.boundary, rootBoundary = options.rootBoundary, altBoundary = options.altBoundary, padding = options.padding, _options$tether = options.tether, tether = _options$tether === void 0 ? true : _options$tether, _options$tetherOffset = options.tetherOffset, tetherOffset = _options$tetherOffset === void 0 ? 0 : _options$tetherOffset;
  var overflow = detectOverflow(state, {
    boundary,
    rootBoundary,
    padding,
    altBoundary
  });
  var basePlacement = getBasePlacement(state.placement);
  var variation = getVariation(state.placement);
  var isBasePlacement = !variation;
  var mainAxis = getMainAxisFromPlacement(basePlacement);
  var altAxis = getAltAxis(mainAxis);
  var popperOffsets2 = state.modifiersData.popperOffsets;
  var referenceRect = state.rects.reference;
  var popperRect = state.rects.popper;
  var tetherOffsetValue = typeof tetherOffset === "function" ? tetherOffset(Object.assign({}, state.rects, {
    placement: state.placement
  })) : tetherOffset;
  var normalizedTetherOffsetValue = typeof tetherOffsetValue === "number" ? {
    mainAxis: tetherOffsetValue,
    altAxis: tetherOffsetValue
  } : Object.assign({
    mainAxis: 0,
    altAxis: 0
  }, tetherOffsetValue);
  var offsetModifierState = state.modifiersData.offset ? state.modifiersData.offset[state.placement] : null;
  var data = {
    x: 0,
    y: 0
  };
  if (!popperOffsets2) {
    return;
  }
  if (checkMainAxis) {
    var _offsetModifierState$;
    var mainSide = mainAxis === "y" ? top : left;
    var altSide = mainAxis === "y" ? bottom : right;
    var len = mainAxis === "y" ? "height" : "width";
    var offset2 = popperOffsets2[mainAxis];
    var min2 = offset2 + overflow[mainSide];
    var max2 = offset2 - overflow[altSide];
    var additive = tether ? -popperRect[len] / 2 : 0;
    var minLen = variation === start2 ? referenceRect[len] : popperRect[len];
    var maxLen = variation === start2 ? -popperRect[len] : -referenceRect[len];
    var arrowElement = state.elements.arrow;
    var arrowRect = tether && arrowElement ? getLayoutRect(arrowElement) : {
      width: 0,
      height: 0
    };
    var arrowPaddingObject = state.modifiersData["arrow#persistent"] ? state.modifiersData["arrow#persistent"].padding : getFreshSideObject();
    var arrowPaddingMin = arrowPaddingObject[mainSide];
    var arrowPaddingMax = arrowPaddingObject[altSide];
    var arrowLen = within(0, referenceRect[len], arrowRect[len]);
    var minOffset = isBasePlacement ? referenceRect[len] / 2 - additive - arrowLen - arrowPaddingMin - normalizedTetherOffsetValue.mainAxis : minLen - arrowLen - arrowPaddingMin - normalizedTetherOffsetValue.mainAxis;
    var maxOffset = isBasePlacement ? -referenceRect[len] / 2 + additive + arrowLen + arrowPaddingMax + normalizedTetherOffsetValue.mainAxis : maxLen + arrowLen + arrowPaddingMax + normalizedTetherOffsetValue.mainAxis;
    var arrowOffsetParent = state.elements.arrow && getOffsetParent(state.elements.arrow);
    var clientOffset = arrowOffsetParent ? mainAxis === "y" ? arrowOffsetParent.clientTop || 0 : arrowOffsetParent.clientLeft || 0 : 0;
    var offsetModifierValue = (_offsetModifierState$ = offsetModifierState == null ? void 0 : offsetModifierState[mainAxis]) != null ? _offsetModifierState$ : 0;
    var tetherMin = offset2 + minOffset - offsetModifierValue - clientOffset;
    var tetherMax = offset2 + maxOffset - offsetModifierValue;
    var preventedOffset = within(tether ? min(min2, tetherMin) : min2, offset2, tether ? max(max2, tetherMax) : max2);
    popperOffsets2[mainAxis] = preventedOffset;
    data[mainAxis] = preventedOffset - offset2;
  }
  if (checkAltAxis) {
    var _offsetModifierState$2;
    var _mainSide = mainAxis === "x" ? top : left;
    var _altSide = mainAxis === "x" ? bottom : right;
    var _offset = popperOffsets2[altAxis];
    var _len = altAxis === "y" ? "height" : "width";
    var _min = _offset + overflow[_mainSide];
    var _max = _offset - overflow[_altSide];
    var isOriginSide = [top, left].indexOf(basePlacement) !== -1;
    var _offsetModifierValue = (_offsetModifierState$2 = offsetModifierState == null ? void 0 : offsetModifierState[altAxis]) != null ? _offsetModifierState$2 : 0;
    var _tetherMin = isOriginSide ? _min : _offset - referenceRect[_len] - popperRect[_len] - _offsetModifierValue + normalizedTetherOffsetValue.altAxis;
    var _tetherMax = isOriginSide ? _offset + referenceRect[_len] + popperRect[_len] - _offsetModifierValue - normalizedTetherOffsetValue.altAxis : _max;
    var _preventedOffset = tether && isOriginSide ? withinMaxClamp(_tetherMin, _offset, _tetherMax) : within(tether ? _tetherMin : _min, _offset, tether ? _tetherMax : _max);
    popperOffsets2[altAxis] = _preventedOffset;
    data[altAxis] = _preventedOffset - _offset;
  }
  state.modifiersData[name] = data;
}
var preventOverflow_default = {
  name: "preventOverflow",
  enabled: true,
  phase: "main",
  fn: preventOverflow,
  requiresIfExists: ["offset"]
};

// node_modules/@popperjs/core/lib/dom-utils/getHTMLElementScroll.js
function getHTMLElementScroll(element) {
  return {
    scrollLeft: element.scrollLeft,
    scrollTop: element.scrollTop
  };
}

// node_modules/@popperjs/core/lib/dom-utils/getNodeScroll.js
function getNodeScroll(node) {
  if (node === getWindow(node) || !isHTMLElement(node)) {
    return getWindowScroll(node);
  } else {
    return getHTMLElementScroll(node);
  }
}

// node_modules/@popperjs/core/lib/dom-utils/getCompositeRect.js
function isElementScaled(element) {
  var rect = element.getBoundingClientRect();
  var scaleX = round(rect.width) / element.offsetWidth || 1;
  var scaleY = round(rect.height) / element.offsetHeight || 1;
  return scaleX !== 1 || scaleY !== 1;
}
function getCompositeRect(elementOrVirtualElement, offsetParent, isFixed) {
  if (isFixed === void 0) {
    isFixed = false;
  }
  var isOffsetParentAnElement = isHTMLElement(offsetParent);
  var offsetParentIsScaled = isHTMLElement(offsetParent) && isElementScaled(offsetParent);
  var documentElement = getDocumentElement(offsetParent);
  var rect = getBoundingClientRect(elementOrVirtualElement, offsetParentIsScaled, isFixed);
  var scroll = {
    scrollLeft: 0,
    scrollTop: 0
  };
  var offsets = {
    x: 0,
    y: 0
  };
  if (isOffsetParentAnElement || !isOffsetParentAnElement && !isFixed) {
    if (getNodeName(offsetParent) !== "body" || // https://github.com/popperjs/popper-core/issues/1078
    isScrollParent(documentElement)) {
      scroll = getNodeScroll(offsetParent);
    }
    if (isHTMLElement(offsetParent)) {
      offsets = getBoundingClientRect(offsetParent, true);
      offsets.x += offsetParent.clientLeft;
      offsets.y += offsetParent.clientTop;
    } else if (documentElement) {
      offsets.x = getWindowScrollBarX(documentElement);
    }
  }
  return {
    x: rect.left + scroll.scrollLeft - offsets.x,
    y: rect.top + scroll.scrollTop - offsets.y,
    width: rect.width,
    height: rect.height
  };
}

// node_modules/@popperjs/core/lib/utils/orderModifiers.js
function order(modifiers) {
  var map = /* @__PURE__ */ new Map();
  var visited = /* @__PURE__ */ new Set();
  var result = [];
  modifiers.forEach(function(modifier) {
    map.set(modifier.name, modifier);
  });
  function sort(modifier) {
    visited.add(modifier.name);
    var requires = [].concat(modifier.requires || [], modifier.requiresIfExists || []);
    requires.forEach(function(dep) {
      if (!visited.has(dep)) {
        var depModifier = map.get(dep);
        if (depModifier) {
          sort(depModifier);
        }
      }
    });
    result.push(modifier);
  }
  modifiers.forEach(function(modifier) {
    if (!visited.has(modifier.name)) {
      sort(modifier);
    }
  });
  return result;
}
function orderModifiers(modifiers) {
  var orderedModifiers = order(modifiers);
  return modifierPhases.reduce(function(acc, phase) {
    return acc.concat(orderedModifiers.filter(function(modifier) {
      return modifier.phase === phase;
    }));
  }, []);
}

// node_modules/@popperjs/core/lib/utils/debounce.js
function debounce2(fn3) {
  var pending;
  return function() {
    if (!pending) {
      pending = new Promise(function(resolve) {
        Promise.resolve().then(function() {
          pending = void 0;
          resolve(fn3());
        });
      });
    }
    return pending;
  };
}

// node_modules/@popperjs/core/lib/utils/mergeByName.js
function mergeByName(modifiers) {
  var merged = modifiers.reduce(function(merged2, current) {
    var existing = merged2[current.name];
    merged2[current.name] = existing ? Object.assign({}, existing, current, {
      options: Object.assign({}, existing.options, current.options),
      data: Object.assign({}, existing.data, current.data)
    }) : current;
    return merged2;
  }, {});
  return Object.keys(merged).map(function(key) {
    return merged[key];
  });
}

// node_modules/@popperjs/core/lib/createPopper.js
var DEFAULT_OPTIONS = {
  placement: "bottom",
  modifiers: [],
  strategy: "absolute"
};
function areValidElements() {
  for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }
  return !args.some(function(element) {
    return !(element && typeof element.getBoundingClientRect === "function");
  });
}
function popperGenerator(generatorOptions) {
  if (generatorOptions === void 0) {
    generatorOptions = {};
  }
  var _generatorOptions = generatorOptions, _generatorOptions$def = _generatorOptions.defaultModifiers, defaultModifiers3 = _generatorOptions$def === void 0 ? [] : _generatorOptions$def, _generatorOptions$def2 = _generatorOptions.defaultOptions, defaultOptions2 = _generatorOptions$def2 === void 0 ? DEFAULT_OPTIONS : _generatorOptions$def2;
  return function createPopper4(reference2, popper2, options) {
    if (options === void 0) {
      options = defaultOptions2;
    }
    var state = {
      placement: "bottom",
      orderedModifiers: [],
      options: Object.assign({}, DEFAULT_OPTIONS, defaultOptions2),
      modifiersData: {},
      elements: {
        reference: reference2,
        popper: popper2
      },
      attributes: {},
      styles: {}
    };
    var effectCleanupFns = [];
    var isDestroyed = false;
    var instance = {
      state,
      setOptions: function setOptions(setOptionsAction) {
        var options2 = typeof setOptionsAction === "function" ? setOptionsAction(state.options) : setOptionsAction;
        cleanupModifierEffects();
        state.options = Object.assign({}, defaultOptions2, state.options, options2);
        state.scrollParents = {
          reference: isElement(reference2) ? listScrollParents(reference2) : reference2.contextElement ? listScrollParents(reference2.contextElement) : [],
          popper: listScrollParents(popper2)
        };
        var orderedModifiers = orderModifiers(mergeByName([].concat(defaultModifiers3, state.options.modifiers)));
        state.orderedModifiers = orderedModifiers.filter(function(m2) {
          return m2.enabled;
        });
        runModifierEffects();
        return instance.update();
      },
      // Sync update – it will always be executed, even if not necessary. This
      // is useful for low frequency updates where sync behavior simplifies the
      // logic.
      // For high frequency updates (e.g. `resize` and `scroll` events), always
      // prefer the async Popper#update method
      forceUpdate: function forceUpdate() {
        if (isDestroyed) {
          return;
        }
        var _state$elements = state.elements, reference3 = _state$elements.reference, popper3 = _state$elements.popper;
        if (!areValidElements(reference3, popper3)) {
          return;
        }
        state.rects = {
          reference: getCompositeRect(reference3, getOffsetParent(popper3), state.options.strategy === "fixed"),
          popper: getLayoutRect(popper3)
        };
        state.reset = false;
        state.placement = state.options.placement;
        state.orderedModifiers.forEach(function(modifier) {
          return state.modifiersData[modifier.name] = Object.assign({}, modifier.data);
        });
        for (var index = 0; index < state.orderedModifiers.length; index++) {
          if (state.reset === true) {
            state.reset = false;
            index = -1;
            continue;
          }
          var _state$orderedModifie = state.orderedModifiers[index], fn3 = _state$orderedModifie.fn, _state$orderedModifie2 = _state$orderedModifie.options, _options = _state$orderedModifie2 === void 0 ? {} : _state$orderedModifie2, name = _state$orderedModifie.name;
          if (typeof fn3 === "function") {
            state = fn3({
              state,
              options: _options,
              name,
              instance
            }) || state;
          }
        }
      },
      // Async and optimistically optimized update – it will not be executed if
      // not necessary (debounced to run at most once-per-tick)
      update: debounce2(function() {
        return new Promise(function(resolve) {
          instance.forceUpdate();
          resolve(state);
        });
      }),
      destroy: function destroy() {
        cleanupModifierEffects();
        isDestroyed = true;
      }
    };
    if (!areValidElements(reference2, popper2)) {
      return instance;
    }
    instance.setOptions(options).then(function(state2) {
      if (!isDestroyed && options.onFirstUpdate) {
        options.onFirstUpdate(state2);
      }
    });
    function runModifierEffects() {
      state.orderedModifiers.forEach(function(_ref) {
        var name = _ref.name, _ref$options = _ref.options, options2 = _ref$options === void 0 ? {} : _ref$options, effect4 = _ref.effect;
        if (typeof effect4 === "function") {
          var cleanupFn = effect4({
            state,
            name,
            instance,
            options: options2
          });
          var noopFn = function noopFn2() {
          };
          effectCleanupFns.push(cleanupFn || noopFn);
        }
      });
    }
    function cleanupModifierEffects() {
      effectCleanupFns.forEach(function(fn3) {
        return fn3();
      });
      effectCleanupFns = [];
    }
    return instance;
  };
}
var createPopper = /* @__PURE__ */ popperGenerator();

// node_modules/@popperjs/core/lib/popper-lite.js
var defaultModifiers = [eventListeners_default, popperOffsets_default, computeStyles_default, applyStyles_default];
var createPopper2 = /* @__PURE__ */ popperGenerator({
  defaultModifiers
});

// node_modules/@popperjs/core/lib/popper.js
var defaultModifiers2 = [eventListeners_default, popperOffsets_default, computeStyles_default, applyStyles_default, offset_default, flip_default, preventOverflow_default, arrow_default, hide_default];
var createPopper3 = /* @__PURE__ */ popperGenerator({
  defaultModifiers: defaultModifiers2
});

// node_modules/bootstrap/dist/js/bootstrap.esm.js
var elementMap = /* @__PURE__ */ new Map();
var Data = {
  set(element, key, instance) {
    if (!elementMap.has(element)) {
      elementMap.set(element, /* @__PURE__ */ new Map());
    }
    const instanceMap = elementMap.get(element);
    if (!instanceMap.has(key) && instanceMap.size !== 0) {
      console.error(`Bootstrap doesn't allow more than one instance per element. Bound instance: ${Array.from(instanceMap.keys())[0]}.`);
      return;
    }
    instanceMap.set(key, instance);
  },
  get(element, key) {
    if (elementMap.has(element)) {
      return elementMap.get(element).get(key) || null;
    }
    return null;
  },
  remove(element, key) {
    if (!elementMap.has(element)) {
      return;
    }
    const instanceMap = elementMap.get(element);
    instanceMap.delete(key);
    if (instanceMap.size === 0) {
      elementMap.delete(element);
    }
  }
};
var MAX_UID = 1e6;
var MILLISECONDS_MULTIPLIER = 1e3;
var TRANSITION_END = "transitionend";
var parseSelector = (selector) => {
  if (selector && window.CSS && window.CSS.escape) {
    selector = selector.replace(/#([^\s"#']+)/g, (match, id2) => `#${CSS.escape(id2)}`);
  }
  return selector;
};
var toType = (object) => {
  if (object === null || object === void 0) {
    return `${object}`;
  }
  return Object.prototype.toString.call(object).match(/\s([a-z]+)/i)[1].toLowerCase();
};
var getUID = (prefix) => {
  do {
    prefix += Math.floor(Math.random() * MAX_UID);
  } while (document.getElementById(prefix));
  return prefix;
};
var getTransitionDurationFromElement = (element) => {
  if (!element) {
    return 0;
  }
  let {
    transitionDuration,
    transitionDelay
  } = window.getComputedStyle(element);
  const floatTransitionDuration = Number.parseFloat(transitionDuration);
  const floatTransitionDelay = Number.parseFloat(transitionDelay);
  if (!floatTransitionDuration && !floatTransitionDelay) {
    return 0;
  }
  transitionDuration = transitionDuration.split(",")[0];
  transitionDelay = transitionDelay.split(",")[0];
  return (Number.parseFloat(transitionDuration) + Number.parseFloat(transitionDelay)) * MILLISECONDS_MULTIPLIER;
};
var triggerTransitionEnd = (element) => {
  element.dispatchEvent(new Event(TRANSITION_END));
};
var isElement2 = (object) => {
  if (!object || typeof object !== "object") {
    return false;
  }
  if (typeof object.jquery !== "undefined") {
    object = object[0];
  }
  return typeof object.nodeType !== "undefined";
};
var getElement = (object) => {
  if (isElement2(object)) {
    return object.jquery ? object[0] : object;
  }
  if (typeof object === "string" && object.length > 0) {
    return document.querySelector(parseSelector(object));
  }
  return null;
};
var isVisible = (element) => {
  if (!isElement2(element) || element.getClientRects().length === 0) {
    return false;
  }
  const elementIsVisible = getComputedStyle(element).getPropertyValue("visibility") === "visible";
  const closedDetails = element.closest("details:not([open])");
  if (!closedDetails) {
    return elementIsVisible;
  }
  if (closedDetails !== element) {
    const summary = element.closest("summary");
    if (summary && summary.parentNode !== closedDetails) {
      return false;
    }
    if (summary === null) {
      return false;
    }
  }
  return elementIsVisible;
};
var isDisabled = (element) => {
  if (!element || element.nodeType !== Node.ELEMENT_NODE) {
    return true;
  }
  if (element.classList.contains("disabled")) {
    return true;
  }
  if (typeof element.disabled !== "undefined") {
    return element.disabled;
  }
  return element.hasAttribute("disabled") && element.getAttribute("disabled") !== "false";
};
var findShadowRoot = (element) => {
  if (!document.documentElement.attachShadow) {
    return null;
  }
  if (typeof element.getRootNode === "function") {
    const root = element.getRootNode();
    return root instanceof ShadowRoot ? root : null;
  }
  if (element instanceof ShadowRoot) {
    return element;
  }
  if (!element.parentNode) {
    return null;
  }
  return findShadowRoot(element.parentNode);
};
var noop = () => {
};
var reflow = (element) => {
  element.offsetHeight;
};
var getjQuery = () => {
  if (window.jQuery && !document.body.hasAttribute("data-bs-no-jquery")) {
    return window.jQuery;
  }
  return null;
};
var DOMContentLoadedCallbacks = [];
var onDOMContentLoaded = (callback) => {
  if (document.readyState === "loading") {
    if (!DOMContentLoadedCallbacks.length) {
      document.addEventListener("DOMContentLoaded", () => {
        for (const callback2 of DOMContentLoadedCallbacks) {
          callback2();
        }
      });
    }
    DOMContentLoadedCallbacks.push(callback);
  } else {
    callback();
  }
};
var isRTL = () => document.documentElement.dir === "rtl";
var defineJQueryPlugin = (plugin) => {
  onDOMContentLoaded(() => {
    const $2 = getjQuery();
    if ($2) {
      const name = plugin.NAME;
      const JQUERY_NO_CONFLICT = $2.fn[name];
      $2.fn[name] = plugin.jQueryInterface;
      $2.fn[name].Constructor = plugin;
      $2.fn[name].noConflict = () => {
        $2.fn[name] = JQUERY_NO_CONFLICT;
        return plugin.jQueryInterface;
      };
    }
  });
};
var execute = (possibleCallback, args = [], defaultValue = possibleCallback) => {
  return typeof possibleCallback === "function" ? possibleCallback.call(...args) : defaultValue;
};
var executeAfterTransition = (callback, transitionElement, waitForTransition = true) => {
  if (!waitForTransition) {
    execute(callback);
    return;
  }
  const durationPadding = 5;
  const emulatedDuration = getTransitionDurationFromElement(transitionElement) + durationPadding;
  let called = false;
  const handler = ({
    target
  }) => {
    if (target !== transitionElement) {
      return;
    }
    called = true;
    transitionElement.removeEventListener(TRANSITION_END, handler);
    execute(callback);
  };
  transitionElement.addEventListener(TRANSITION_END, handler);
  setTimeout(() => {
    if (!called) {
      triggerTransitionEnd(transitionElement);
    }
  }, emulatedDuration);
};
var getNextActiveElement = (list, activeElement, shouldGetNext, isCycleAllowed) => {
  const listLength = list.length;
  let index = list.indexOf(activeElement);
  if (index === -1) {
    return !shouldGetNext && isCycleAllowed ? list[listLength - 1] : list[0];
  }
  index += shouldGetNext ? 1 : -1;
  if (isCycleAllowed) {
    index = (index + listLength) % listLength;
  }
  return list[Math.max(0, Math.min(index, listLength - 1))];
};
var namespaceRegex = /[^.]*(?=\..*)\.|.*/;
var stripNameRegex = /\..*/;
var stripUidRegex = /::\d+$/;
var eventRegistry = {};
var uidEvent = 1;
var customEvents = {
  mouseenter: "mouseover",
  mouseleave: "mouseout"
};
var nativeEvents = /* @__PURE__ */ new Set(["click", "dblclick", "mouseup", "mousedown", "contextmenu", "mousewheel", "DOMMouseScroll", "mouseover", "mouseout", "mousemove", "selectstart", "selectend", "keydown", "keypress", "keyup", "orientationchange", "touchstart", "touchmove", "touchend", "touchcancel", "pointerdown", "pointermove", "pointerup", "pointerleave", "pointercancel", "gesturestart", "gesturechange", "gestureend", "focus", "blur", "change", "reset", "select", "submit", "focusin", "focusout", "load", "unload", "beforeunload", "resize", "move", "DOMContentLoaded", "readystatechange", "error", "abort", "scroll"]);
function makeEventUid(element, uid) {
  return uid && `${uid}::${uidEvent++}` || element.uidEvent || uidEvent++;
}
function getElementEvents(element) {
  const uid = makeEventUid(element);
  element.uidEvent = uid;
  eventRegistry[uid] = eventRegistry[uid] || {};
  return eventRegistry[uid];
}
function bootstrapHandler(element, fn3) {
  return function handler(event) {
    hydrateObj(event, {
      delegateTarget: element
    });
    if (handler.oneOff) {
      EventHandler.off(element, event.type, fn3);
    }
    return fn3.apply(element, [event]);
  };
}
function bootstrapDelegationHandler(element, selector, fn3) {
  return function handler(event) {
    const domElements = element.querySelectorAll(selector);
    for (let {
      target
    } = event; target && target !== this; target = target.parentNode) {
      for (const domElement of domElements) {
        if (domElement !== target) {
          continue;
        }
        hydrateObj(event, {
          delegateTarget: target
        });
        if (handler.oneOff) {
          EventHandler.off(element, event.type, selector, fn3);
        }
        return fn3.apply(target, [event]);
      }
    }
  };
}
function findHandler(events, callable, delegationSelector = null) {
  return Object.values(events).find((event) => event.callable === callable && event.delegationSelector === delegationSelector);
}
function normalizeParameters(originalTypeEvent, handler, delegationFunction) {
  const isDelegated = typeof handler === "string";
  const callable = isDelegated ? delegationFunction : handler || delegationFunction;
  let typeEvent = getTypeEvent(originalTypeEvent);
  if (!nativeEvents.has(typeEvent)) {
    typeEvent = originalTypeEvent;
  }
  return [isDelegated, callable, typeEvent];
}
function addHandler(element, originalTypeEvent, handler, delegationFunction, oneOff) {
  if (typeof originalTypeEvent !== "string" || !element) {
    return;
  }
  let [isDelegated, callable, typeEvent] = normalizeParameters(originalTypeEvent, handler, delegationFunction);
  if (originalTypeEvent in customEvents) {
    const wrapFunction = (fn4) => {
      return function(event) {
        if (!event.relatedTarget || event.relatedTarget !== event.delegateTarget && !event.delegateTarget.contains(event.relatedTarget)) {
          return fn4.call(this, event);
        }
      };
    };
    callable = wrapFunction(callable);
  }
  const events = getElementEvents(element);
  const handlers = events[typeEvent] || (events[typeEvent] = {});
  const previousFunction = findHandler(handlers, callable, isDelegated ? handler : null);
  if (previousFunction) {
    previousFunction.oneOff = previousFunction.oneOff && oneOff;
    return;
  }
  const uid = makeEventUid(callable, originalTypeEvent.replace(namespaceRegex, ""));
  const fn3 = isDelegated ? bootstrapDelegationHandler(element, handler, callable) : bootstrapHandler(element, callable);
  fn3.delegationSelector = isDelegated ? handler : null;
  fn3.callable = callable;
  fn3.oneOff = oneOff;
  fn3.uidEvent = uid;
  handlers[uid] = fn3;
  element.addEventListener(typeEvent, fn3, isDelegated);
}
function removeHandler(element, events, typeEvent, handler, delegationSelector) {
  const fn3 = findHandler(events[typeEvent], handler, delegationSelector);
  if (!fn3) {
    return;
  }
  element.removeEventListener(typeEvent, fn3, Boolean(delegationSelector));
  delete events[typeEvent][fn3.uidEvent];
}
function removeNamespacedHandlers(element, events, typeEvent, namespace) {
  const storeElementEvent = events[typeEvent] || {};
  for (const [handlerKey, event] of Object.entries(storeElementEvent)) {
    if (handlerKey.includes(namespace)) {
      removeHandler(element, events, typeEvent, event.callable, event.delegationSelector);
    }
  }
}
function getTypeEvent(event) {
  event = event.replace(stripNameRegex, "");
  return customEvents[event] || event;
}
var EventHandler = {
  on(element, event, handler, delegationFunction) {
    addHandler(element, event, handler, delegationFunction, false);
  },
  one(element, event, handler, delegationFunction) {
    addHandler(element, event, handler, delegationFunction, true);
  },
  off(element, originalTypeEvent, handler, delegationFunction) {
    if (typeof originalTypeEvent !== "string" || !element) {
      return;
    }
    const [isDelegated, callable, typeEvent] = normalizeParameters(originalTypeEvent, handler, delegationFunction);
    const inNamespace = typeEvent !== originalTypeEvent;
    const events = getElementEvents(element);
    const storeElementEvent = events[typeEvent] || {};
    const isNamespace = originalTypeEvent.startsWith(".");
    if (typeof callable !== "undefined") {
      if (!Object.keys(storeElementEvent).length) {
        return;
      }
      removeHandler(element, events, typeEvent, callable, isDelegated ? handler : null);
      return;
    }
    if (isNamespace) {
      for (const elementEvent of Object.keys(events)) {
        removeNamespacedHandlers(element, events, elementEvent, originalTypeEvent.slice(1));
      }
    }
    for (const [keyHandlers, event] of Object.entries(storeElementEvent)) {
      const handlerKey = keyHandlers.replace(stripUidRegex, "");
      if (!inNamespace || originalTypeEvent.includes(handlerKey)) {
        removeHandler(element, events, typeEvent, event.callable, event.delegationSelector);
      }
    }
  },
  trigger(element, event, args) {
    if (typeof event !== "string" || !element) {
      return null;
    }
    const $2 = getjQuery();
    const typeEvent = getTypeEvent(event);
    const inNamespace = event !== typeEvent;
    let jQueryEvent = null;
    let bubbles = true;
    let nativeDispatch = true;
    let defaultPrevented = false;
    if (inNamespace && $2) {
      jQueryEvent = $2.Event(event, args);
      $2(element).trigger(jQueryEvent);
      bubbles = !jQueryEvent.isPropagationStopped();
      nativeDispatch = !jQueryEvent.isImmediatePropagationStopped();
      defaultPrevented = jQueryEvent.isDefaultPrevented();
    }
    const evt = hydrateObj(new Event(event, {
      bubbles,
      cancelable: true
    }), args);
    if (defaultPrevented) {
      evt.preventDefault();
    }
    if (nativeDispatch) {
      element.dispatchEvent(evt);
    }
    if (evt.defaultPrevented && jQueryEvent) {
      jQueryEvent.preventDefault();
    }
    return evt;
  }
};
function hydrateObj(obj, meta = {}) {
  for (const [key, value] of Object.entries(meta)) {
    try {
      obj[key] = value;
    } catch (_unused) {
      Object.defineProperty(obj, key, {
        configurable: true,
        get() {
          return value;
        }
      });
    }
  }
  return obj;
}
function normalizeData(value) {
  if (value === "true") {
    return true;
  }
  if (value === "false") {
    return false;
  }
  if (value === Number(value).toString()) {
    return Number(value);
  }
  if (value === "" || value === "null") {
    return null;
  }
  if (typeof value !== "string") {
    return value;
  }
  try {
    return JSON.parse(decodeURIComponent(value));
  } catch (_unused) {
    return value;
  }
}
function normalizeDataKey(key) {
  return key.replace(/[A-Z]/g, (chr) => `-${chr.toLowerCase()}`);
}
var Manipulator = {
  setDataAttribute(element, key, value) {
    element.setAttribute(`data-bs-${normalizeDataKey(key)}`, value);
  },
  removeDataAttribute(element, key) {
    element.removeAttribute(`data-bs-${normalizeDataKey(key)}`);
  },
  getDataAttributes(element) {
    if (!element) {
      return {};
    }
    const attributes = {};
    const bsKeys = Object.keys(element.dataset).filter((key) => key.startsWith("bs") && !key.startsWith("bsConfig"));
    for (const key of bsKeys) {
      let pureKey = key.replace(/^bs/, "");
      pureKey = pureKey.charAt(0).toLowerCase() + pureKey.slice(1);
      attributes[pureKey] = normalizeData(element.dataset[key]);
    }
    return attributes;
  },
  getDataAttribute(element, key) {
    return normalizeData(element.getAttribute(`data-bs-${normalizeDataKey(key)}`));
  }
};
var Config2 = class {
  // Getters
  static get Default() {
    return {};
  }
  static get DefaultType() {
    return {};
  }
  static get NAME() {
    throw new Error('You have to implement the static method "NAME", for each component!');
  }
  _getConfig(config2) {
    config2 = this._mergeConfigObj(config2);
    config2 = this._configAfterMerge(config2);
    this._typeCheckConfig(config2);
    return config2;
  }
  _configAfterMerge(config2) {
    return config2;
  }
  _mergeConfigObj(config2, element) {
    const jsonConfig = isElement2(element) ? Manipulator.getDataAttribute(element, "config") : {};
    return {
      ...this.constructor.Default,
      ...typeof jsonConfig === "object" ? jsonConfig : {},
      ...isElement2(element) ? Manipulator.getDataAttributes(element) : {},
      ...typeof config2 === "object" ? config2 : {}
    };
  }
  _typeCheckConfig(config2, configTypes = this.constructor.DefaultType) {
    for (const [property, expectedTypes] of Object.entries(configTypes)) {
      const value = config2[property];
      const valueType = isElement2(value) ? "element" : toType(value);
      if (!new RegExp(expectedTypes).test(valueType)) {
        throw new TypeError(`${this.constructor.NAME.toUpperCase()}: Option "${property}" provided type "${valueType}" but expected type "${expectedTypes}".`);
      }
    }
  }
};
var VERSION = "5.3.5";
var BaseComponent = class extends Config2 {
  constructor(element, config2) {
    super();
    element = getElement(element);
    if (!element) {
      return;
    }
    this._element = element;
    this._config = this._getConfig(config2);
    Data.set(this._element, this.constructor.DATA_KEY, this);
  }
  // Public
  dispose() {
    Data.remove(this._element, this.constructor.DATA_KEY);
    EventHandler.off(this._element, this.constructor.EVENT_KEY);
    for (const propertyName of Object.getOwnPropertyNames(this)) {
      this[propertyName] = null;
    }
  }
  _queueCallback(callback, element, isAnimated = true) {
    executeAfterTransition(callback, element, isAnimated);
  }
  _getConfig(config2) {
    config2 = this._mergeConfigObj(config2, this._element);
    config2 = this._configAfterMerge(config2);
    this._typeCheckConfig(config2);
    return config2;
  }
  // Static
  static getInstance(element) {
    return Data.get(getElement(element), this.DATA_KEY);
  }
  static getOrCreateInstance(element, config2 = {}) {
    return this.getInstance(element) || new this(element, typeof config2 === "object" ? config2 : null);
  }
  static get VERSION() {
    return VERSION;
  }
  static get DATA_KEY() {
    return `bs.${this.NAME}`;
  }
  static get EVENT_KEY() {
    return `.${this.DATA_KEY}`;
  }
  static eventName(name) {
    return `${name}${this.EVENT_KEY}`;
  }
};
var getSelector = (element) => {
  let selector = element.getAttribute("data-bs-target");
  if (!selector || selector === "#") {
    let hrefAttribute = element.getAttribute("href");
    if (!hrefAttribute || !hrefAttribute.includes("#") && !hrefAttribute.startsWith(".")) {
      return null;
    }
    if (hrefAttribute.includes("#") && !hrefAttribute.startsWith("#")) {
      hrefAttribute = `#${hrefAttribute.split("#")[1]}`;
    }
    selector = hrefAttribute && hrefAttribute !== "#" ? hrefAttribute.trim() : null;
  }
  return selector ? selector.split(",").map((sel) => parseSelector(sel)).join(",") : null;
};
var SelectorEngine = {
  find(selector, element = document.documentElement) {
    return [].concat(...Element.prototype.querySelectorAll.call(element, selector));
  },
  findOne(selector, element = document.documentElement) {
    return Element.prototype.querySelector.call(element, selector);
  },
  children(element, selector) {
    return [].concat(...element.children).filter((child) => child.matches(selector));
  },
  parents(element, selector) {
    const parents = [];
    let ancestor = element.parentNode.closest(selector);
    while (ancestor) {
      parents.push(ancestor);
      ancestor = ancestor.parentNode.closest(selector);
    }
    return parents;
  },
  prev(element, selector) {
    let previous = element.previousElementSibling;
    while (previous) {
      if (previous.matches(selector)) {
        return [previous];
      }
      previous = previous.previousElementSibling;
    }
    return [];
  },
  // TODO: this is now unused; remove later along with prev()
  next(element, selector) {
    let next = element.nextElementSibling;
    while (next) {
      if (next.matches(selector)) {
        return [next];
      }
      next = next.nextElementSibling;
    }
    return [];
  },
  focusableChildren(element) {
    const focusables = ["a", "button", "input", "textarea", "select", "details", "[tabindex]", '[contenteditable="true"]'].map((selector) => `${selector}:not([tabindex^="-"])`).join(",");
    return this.find(focusables, element).filter((el) => !isDisabled(el) && isVisible(el));
  },
  getSelectorFromElement(element) {
    const selector = getSelector(element);
    if (selector) {
      return SelectorEngine.findOne(selector) ? selector : null;
    }
    return null;
  },
  getElementFromSelector(element) {
    const selector = getSelector(element);
    return selector ? SelectorEngine.findOne(selector) : null;
  },
  getMultipleElementsFromSelector(element) {
    const selector = getSelector(element);
    return selector ? SelectorEngine.find(selector) : [];
  }
};
var enableDismissTrigger = (component, method = "hide") => {
  const clickEvent = `click.dismiss${component.EVENT_KEY}`;
  const name = component.NAME;
  EventHandler.on(document, clickEvent, `[data-bs-dismiss="${name}"]`, function(event) {
    if (["A", "AREA"].includes(this.tagName)) {
      event.preventDefault();
    }
    if (isDisabled(this)) {
      return;
    }
    const target = SelectorEngine.getElementFromSelector(this) || this.closest(`.${name}`);
    const instance = component.getOrCreateInstance(target);
    instance[method]();
  });
};
var NAME$f = "alert";
var DATA_KEY$a = "bs.alert";
var EVENT_KEY$b = `.${DATA_KEY$a}`;
var EVENT_CLOSE = `close${EVENT_KEY$b}`;
var EVENT_CLOSED = `closed${EVENT_KEY$b}`;
var CLASS_NAME_FADE$5 = "fade";
var CLASS_NAME_SHOW$8 = "show";
var Alert = class _Alert extends BaseComponent {
  // Getters
  static get NAME() {
    return NAME$f;
  }
  // Public
  close() {
    const closeEvent = EventHandler.trigger(this._element, EVENT_CLOSE);
    if (closeEvent.defaultPrevented) {
      return;
    }
    this._element.classList.remove(CLASS_NAME_SHOW$8);
    const isAnimated = this._element.classList.contains(CLASS_NAME_FADE$5);
    this._queueCallback(() => this._destroyElement(), this._element, isAnimated);
  }
  // Private
  _destroyElement() {
    this._element.remove();
    EventHandler.trigger(this._element, EVENT_CLOSED);
    this.dispose();
  }
  // Static
  static jQueryInterface(config2) {
    return this.each(function() {
      const data = _Alert.getOrCreateInstance(this);
      if (typeof config2 !== "string") {
        return;
      }
      if (data[config2] === void 0 || config2.startsWith("_") || config2 === "constructor") {
        throw new TypeError(`No method named "${config2}"`);
      }
      data[config2](this);
    });
  }
};
enableDismissTrigger(Alert, "close");
defineJQueryPlugin(Alert);
var NAME$e = "button";
var DATA_KEY$9 = "bs.button";
var EVENT_KEY$a = `.${DATA_KEY$9}`;
var DATA_API_KEY$6 = ".data-api";
var CLASS_NAME_ACTIVE$3 = "active";
var SELECTOR_DATA_TOGGLE$5 = '[data-bs-toggle="button"]';
var EVENT_CLICK_DATA_API$6 = `click${EVENT_KEY$a}${DATA_API_KEY$6}`;
var Button = class _Button extends BaseComponent {
  // Getters
  static get NAME() {
    return NAME$e;
  }
  // Public
  toggle() {
    this._element.setAttribute("aria-pressed", this._element.classList.toggle(CLASS_NAME_ACTIVE$3));
  }
  // Static
  static jQueryInterface(config2) {
    return this.each(function() {
      const data = _Button.getOrCreateInstance(this);
      if (config2 === "toggle") {
        data[config2]();
      }
    });
  }
};
EventHandler.on(document, EVENT_CLICK_DATA_API$6, SELECTOR_DATA_TOGGLE$5, (event) => {
  event.preventDefault();
  const button = event.target.closest(SELECTOR_DATA_TOGGLE$5);
  const data = Button.getOrCreateInstance(button);
  data.toggle();
});
defineJQueryPlugin(Button);
var NAME$d = "swipe";
var EVENT_KEY$9 = ".bs.swipe";
var EVENT_TOUCHSTART = `touchstart${EVENT_KEY$9}`;
var EVENT_TOUCHMOVE = `touchmove${EVENT_KEY$9}`;
var EVENT_TOUCHEND = `touchend${EVENT_KEY$9}`;
var EVENT_POINTERDOWN = `pointerdown${EVENT_KEY$9}`;
var EVENT_POINTERUP = `pointerup${EVENT_KEY$9}`;
var POINTER_TYPE_TOUCH = "touch";
var POINTER_TYPE_PEN = "pen";
var CLASS_NAME_POINTER_EVENT = "pointer-event";
var SWIPE_THRESHOLD = 40;
var Default$c = {
  endCallback: null,
  leftCallback: null,
  rightCallback: null
};
var DefaultType$c = {
  endCallback: "(function|null)",
  leftCallback: "(function|null)",
  rightCallback: "(function|null)"
};
var Swipe = class _Swipe extends Config2 {
  constructor(element, config2) {
    super();
    this._element = element;
    if (!element || !_Swipe.isSupported()) {
      return;
    }
    this._config = this._getConfig(config2);
    this._deltaX = 0;
    this._supportPointerEvents = Boolean(window.PointerEvent);
    this._initEvents();
  }
  // Getters
  static get Default() {
    return Default$c;
  }
  static get DefaultType() {
    return DefaultType$c;
  }
  static get NAME() {
    return NAME$d;
  }
  // Public
  dispose() {
    EventHandler.off(this._element, EVENT_KEY$9);
  }
  // Private
  _start(event) {
    if (!this._supportPointerEvents) {
      this._deltaX = event.touches[0].clientX;
      return;
    }
    if (this._eventIsPointerPenTouch(event)) {
      this._deltaX = event.clientX;
    }
  }
  _end(event) {
    if (this._eventIsPointerPenTouch(event)) {
      this._deltaX = event.clientX - this._deltaX;
    }
    this._handleSwipe();
    execute(this._config.endCallback);
  }
  _move(event) {
    this._deltaX = event.touches && event.touches.length > 1 ? 0 : event.touches[0].clientX - this._deltaX;
  }
  _handleSwipe() {
    const absDeltaX = Math.abs(this._deltaX);
    if (absDeltaX <= SWIPE_THRESHOLD) {
      return;
    }
    const direction = absDeltaX / this._deltaX;
    this._deltaX = 0;
    if (!direction) {
      return;
    }
    execute(direction > 0 ? this._config.rightCallback : this._config.leftCallback);
  }
  _initEvents() {
    if (this._supportPointerEvents) {
      EventHandler.on(this._element, EVENT_POINTERDOWN, (event) => this._start(event));
      EventHandler.on(this._element, EVENT_POINTERUP, (event) => this._end(event));
      this._element.classList.add(CLASS_NAME_POINTER_EVENT);
    } else {
      EventHandler.on(this._element, EVENT_TOUCHSTART, (event) => this._start(event));
      EventHandler.on(this._element, EVENT_TOUCHMOVE, (event) => this._move(event));
      EventHandler.on(this._element, EVENT_TOUCHEND, (event) => this._end(event));
    }
  }
  _eventIsPointerPenTouch(event) {
    return this._supportPointerEvents && (event.pointerType === POINTER_TYPE_PEN || event.pointerType === POINTER_TYPE_TOUCH);
  }
  // Static
  static isSupported() {
    return "ontouchstart" in document.documentElement || navigator.maxTouchPoints > 0;
  }
};
var NAME$c = "carousel";
var DATA_KEY$8 = "bs.carousel";
var EVENT_KEY$8 = `.${DATA_KEY$8}`;
var DATA_API_KEY$5 = ".data-api";
var ARROW_LEFT_KEY$1 = "ArrowLeft";
var ARROW_RIGHT_KEY$1 = "ArrowRight";
var TOUCHEVENT_COMPAT_WAIT = 500;
var ORDER_NEXT = "next";
var ORDER_PREV = "prev";
var DIRECTION_LEFT = "left";
var DIRECTION_RIGHT = "right";
var EVENT_SLIDE = `slide${EVENT_KEY$8}`;
var EVENT_SLID = `slid${EVENT_KEY$8}`;
var EVENT_KEYDOWN$1 = `keydown${EVENT_KEY$8}`;
var EVENT_MOUSEENTER$1 = `mouseenter${EVENT_KEY$8}`;
var EVENT_MOUSELEAVE$1 = `mouseleave${EVENT_KEY$8}`;
var EVENT_DRAG_START = `dragstart${EVENT_KEY$8}`;
var EVENT_LOAD_DATA_API$3 = `load${EVENT_KEY$8}${DATA_API_KEY$5}`;
var EVENT_CLICK_DATA_API$5 = `click${EVENT_KEY$8}${DATA_API_KEY$5}`;
var CLASS_NAME_CAROUSEL = "carousel";
var CLASS_NAME_ACTIVE$2 = "active";
var CLASS_NAME_SLIDE = "slide";
var CLASS_NAME_END = "carousel-item-end";
var CLASS_NAME_START = "carousel-item-start";
var CLASS_NAME_NEXT = "carousel-item-next";
var CLASS_NAME_PREV = "carousel-item-prev";
var SELECTOR_ACTIVE = ".active";
var SELECTOR_ITEM = ".carousel-item";
var SELECTOR_ACTIVE_ITEM = SELECTOR_ACTIVE + SELECTOR_ITEM;
var SELECTOR_ITEM_IMG = ".carousel-item img";
var SELECTOR_INDICATORS = ".carousel-indicators";
var SELECTOR_DATA_SLIDE = "[data-bs-slide], [data-bs-slide-to]";
var SELECTOR_DATA_RIDE = '[data-bs-ride="carousel"]';
var KEY_TO_DIRECTION = {
  [ARROW_LEFT_KEY$1]: DIRECTION_RIGHT,
  [ARROW_RIGHT_KEY$1]: DIRECTION_LEFT
};
var Default$b = {
  interval: 5e3,
  keyboard: true,
  pause: "hover",
  ride: false,
  touch: true,
  wrap: true
};
var DefaultType$b = {
  interval: "(number|boolean)",
  // TODO:v6 remove boolean support
  keyboard: "boolean",
  pause: "(string|boolean)",
  ride: "(boolean|string)",
  touch: "boolean",
  wrap: "boolean"
};
var Carousel = class _Carousel extends BaseComponent {
  constructor(element, config2) {
    super(element, config2);
    this._interval = null;
    this._activeElement = null;
    this._isSliding = false;
    this.touchTimeout = null;
    this._swipeHelper = null;
    this._indicatorsElement = SelectorEngine.findOne(SELECTOR_INDICATORS, this._element);
    this._addEventListeners();
    if (this._config.ride === CLASS_NAME_CAROUSEL) {
      this.cycle();
    }
  }
  // Getters
  static get Default() {
    return Default$b;
  }
  static get DefaultType() {
    return DefaultType$b;
  }
  static get NAME() {
    return NAME$c;
  }
  // Public
  next() {
    this._slide(ORDER_NEXT);
  }
  nextWhenVisible() {
    if (!document.hidden && isVisible(this._element)) {
      this.next();
    }
  }
  prev() {
    this._slide(ORDER_PREV);
  }
  pause() {
    if (this._isSliding) {
      triggerTransitionEnd(this._element);
    }
    this._clearInterval();
  }
  cycle() {
    this._clearInterval();
    this._updateInterval();
    this._interval = setInterval(() => this.nextWhenVisible(), this._config.interval);
  }
  _maybeEnableCycle() {
    if (!this._config.ride) {
      return;
    }
    if (this._isSliding) {
      EventHandler.one(this._element, EVENT_SLID, () => this.cycle());
      return;
    }
    this.cycle();
  }
  to(index) {
    const items = this._getItems();
    if (index > items.length - 1 || index < 0) {
      return;
    }
    if (this._isSliding) {
      EventHandler.one(this._element, EVENT_SLID, () => this.to(index));
      return;
    }
    const activeIndex = this._getItemIndex(this._getActive());
    if (activeIndex === index) {
      return;
    }
    const order2 = index > activeIndex ? ORDER_NEXT : ORDER_PREV;
    this._slide(order2, items[index]);
  }
  dispose() {
    if (this._swipeHelper) {
      this._swipeHelper.dispose();
    }
    super.dispose();
  }
  // Private
  _configAfterMerge(config2) {
    config2.defaultInterval = config2.interval;
    return config2;
  }
  _addEventListeners() {
    if (this._config.keyboard) {
      EventHandler.on(this._element, EVENT_KEYDOWN$1, (event) => this._keydown(event));
    }
    if (this._config.pause === "hover") {
      EventHandler.on(this._element, EVENT_MOUSEENTER$1, () => this.pause());
      EventHandler.on(this._element, EVENT_MOUSELEAVE$1, () => this._maybeEnableCycle());
    }
    if (this._config.touch && Swipe.isSupported()) {
      this._addTouchEventListeners();
    }
  }
  _addTouchEventListeners() {
    for (const img of SelectorEngine.find(SELECTOR_ITEM_IMG, this._element)) {
      EventHandler.on(img, EVENT_DRAG_START, (event) => event.preventDefault());
    }
    const endCallBack = () => {
      if (this._config.pause !== "hover") {
        return;
      }
      this.pause();
      if (this.touchTimeout) {
        clearTimeout(this.touchTimeout);
      }
      this.touchTimeout = setTimeout(() => this._maybeEnableCycle(), TOUCHEVENT_COMPAT_WAIT + this._config.interval);
    };
    const swipeConfig = {
      leftCallback: () => this._slide(this._directionToOrder(DIRECTION_LEFT)),
      rightCallback: () => this._slide(this._directionToOrder(DIRECTION_RIGHT)),
      endCallback: endCallBack
    };
    this._swipeHelper = new Swipe(this._element, swipeConfig);
  }
  _keydown(event) {
    if (/input|textarea/i.test(event.target.tagName)) {
      return;
    }
    const direction = KEY_TO_DIRECTION[event.key];
    if (direction) {
      event.preventDefault();
      this._slide(this._directionToOrder(direction));
    }
  }
  _getItemIndex(element) {
    return this._getItems().indexOf(element);
  }
  _setActiveIndicatorElement(index) {
    if (!this._indicatorsElement) {
      return;
    }
    const activeIndicator = SelectorEngine.findOne(SELECTOR_ACTIVE, this._indicatorsElement);
    activeIndicator.classList.remove(CLASS_NAME_ACTIVE$2);
    activeIndicator.removeAttribute("aria-current");
    const newActiveIndicator = SelectorEngine.findOne(`[data-bs-slide-to="${index}"]`, this._indicatorsElement);
    if (newActiveIndicator) {
      newActiveIndicator.classList.add(CLASS_NAME_ACTIVE$2);
      newActiveIndicator.setAttribute("aria-current", "true");
    }
  }
  _updateInterval() {
    const element = this._activeElement || this._getActive();
    if (!element) {
      return;
    }
    const elementInterval = Number.parseInt(element.getAttribute("data-bs-interval"), 10);
    this._config.interval = elementInterval || this._config.defaultInterval;
  }
  _slide(order2, element = null) {
    if (this._isSliding) {
      return;
    }
    const activeElement = this._getActive();
    const isNext = order2 === ORDER_NEXT;
    const nextElement = element || getNextActiveElement(this._getItems(), activeElement, isNext, this._config.wrap);
    if (nextElement === activeElement) {
      return;
    }
    const nextElementIndex = this._getItemIndex(nextElement);
    const triggerEvent = (eventName) => {
      return EventHandler.trigger(this._element, eventName, {
        relatedTarget: nextElement,
        direction: this._orderToDirection(order2),
        from: this._getItemIndex(activeElement),
        to: nextElementIndex
      });
    };
    const slideEvent = triggerEvent(EVENT_SLIDE);
    if (slideEvent.defaultPrevented) {
      return;
    }
    if (!activeElement || !nextElement) {
      return;
    }
    const isCycling = Boolean(this._interval);
    this.pause();
    this._isSliding = true;
    this._setActiveIndicatorElement(nextElementIndex);
    this._activeElement = nextElement;
    const directionalClassName = isNext ? CLASS_NAME_START : CLASS_NAME_END;
    const orderClassName = isNext ? CLASS_NAME_NEXT : CLASS_NAME_PREV;
    nextElement.classList.add(orderClassName);
    reflow(nextElement);
    activeElement.classList.add(directionalClassName);
    nextElement.classList.add(directionalClassName);
    const completeCallBack = () => {
      nextElement.classList.remove(directionalClassName, orderClassName);
      nextElement.classList.add(CLASS_NAME_ACTIVE$2);
      activeElement.classList.remove(CLASS_NAME_ACTIVE$2, orderClassName, directionalClassName);
      this._isSliding = false;
      triggerEvent(EVENT_SLID);
    };
    this._queueCallback(completeCallBack, activeElement, this._isAnimated());
    if (isCycling) {
      this.cycle();
    }
  }
  _isAnimated() {
    return this._element.classList.contains(CLASS_NAME_SLIDE);
  }
  _getActive() {
    return SelectorEngine.findOne(SELECTOR_ACTIVE_ITEM, this._element);
  }
  _getItems() {
    return SelectorEngine.find(SELECTOR_ITEM, this._element);
  }
  _clearInterval() {
    if (this._interval) {
      clearInterval(this._interval);
      this._interval = null;
    }
  }
  _directionToOrder(direction) {
    if (isRTL()) {
      return direction === DIRECTION_LEFT ? ORDER_PREV : ORDER_NEXT;
    }
    return direction === DIRECTION_LEFT ? ORDER_NEXT : ORDER_PREV;
  }
  _orderToDirection(order2) {
    if (isRTL()) {
      return order2 === ORDER_PREV ? DIRECTION_LEFT : DIRECTION_RIGHT;
    }
    return order2 === ORDER_PREV ? DIRECTION_RIGHT : DIRECTION_LEFT;
  }
  // Static
  static jQueryInterface(config2) {
    return this.each(function() {
      const data = _Carousel.getOrCreateInstance(this, config2);
      if (typeof config2 === "number") {
        data.to(config2);
        return;
      }
      if (typeof config2 === "string") {
        if (data[config2] === void 0 || config2.startsWith("_") || config2 === "constructor") {
          throw new TypeError(`No method named "${config2}"`);
        }
        data[config2]();
      }
    });
  }
};
EventHandler.on(document, EVENT_CLICK_DATA_API$5, SELECTOR_DATA_SLIDE, function(event) {
  const target = SelectorEngine.getElementFromSelector(this);
  if (!target || !target.classList.contains(CLASS_NAME_CAROUSEL)) {
    return;
  }
  event.preventDefault();
  const carousel = Carousel.getOrCreateInstance(target);
  const slideIndex = this.getAttribute("data-bs-slide-to");
  if (slideIndex) {
    carousel.to(slideIndex);
    carousel._maybeEnableCycle();
    return;
  }
  if (Manipulator.getDataAttribute(this, "slide") === "next") {
    carousel.next();
    carousel._maybeEnableCycle();
    return;
  }
  carousel.prev();
  carousel._maybeEnableCycle();
});
EventHandler.on(window, EVENT_LOAD_DATA_API$3, () => {
  const carousels = SelectorEngine.find(SELECTOR_DATA_RIDE);
  for (const carousel of carousels) {
    Carousel.getOrCreateInstance(carousel);
  }
});
defineJQueryPlugin(Carousel);
var NAME$b = "collapse";
var DATA_KEY$7 = "bs.collapse";
var EVENT_KEY$7 = `.${DATA_KEY$7}`;
var DATA_API_KEY$4 = ".data-api";
var EVENT_SHOW$6 = `show${EVENT_KEY$7}`;
var EVENT_SHOWN$6 = `shown${EVENT_KEY$7}`;
var EVENT_HIDE$6 = `hide${EVENT_KEY$7}`;
var EVENT_HIDDEN$6 = `hidden${EVENT_KEY$7}`;
var EVENT_CLICK_DATA_API$4 = `click${EVENT_KEY$7}${DATA_API_KEY$4}`;
var CLASS_NAME_SHOW$7 = "show";
var CLASS_NAME_COLLAPSE = "collapse";
var CLASS_NAME_COLLAPSING = "collapsing";
var CLASS_NAME_COLLAPSED = "collapsed";
var CLASS_NAME_DEEPER_CHILDREN = `:scope .${CLASS_NAME_COLLAPSE} .${CLASS_NAME_COLLAPSE}`;
var CLASS_NAME_HORIZONTAL = "collapse-horizontal";
var WIDTH = "width";
var HEIGHT = "height";
var SELECTOR_ACTIVES = ".collapse.show, .collapse.collapsing";
var SELECTOR_DATA_TOGGLE$4 = '[data-bs-toggle="collapse"]';
var Default$a = {
  parent: null,
  toggle: true
};
var DefaultType$a = {
  parent: "(null|element)",
  toggle: "boolean"
};
var Collapse = class _Collapse extends BaseComponent {
  constructor(element, config2) {
    super(element, config2);
    this._isTransitioning = false;
    this._triggerArray = [];
    const toggleList = SelectorEngine.find(SELECTOR_DATA_TOGGLE$4);
    for (const elem of toggleList) {
      const selector = SelectorEngine.getSelectorFromElement(elem);
      const filterElement = SelectorEngine.find(selector).filter((foundElement) => foundElement === this._element);
      if (selector !== null && filterElement.length) {
        this._triggerArray.push(elem);
      }
    }
    this._initializeChildren();
    if (!this._config.parent) {
      this._addAriaAndCollapsedClass(this._triggerArray, this._isShown());
    }
    if (this._config.toggle) {
      this.toggle();
    }
  }
  // Getters
  static get Default() {
    return Default$a;
  }
  static get DefaultType() {
    return DefaultType$a;
  }
  static get NAME() {
    return NAME$b;
  }
  // Public
  toggle() {
    if (this._isShown()) {
      this.hide();
    } else {
      this.show();
    }
  }
  show() {
    if (this._isTransitioning || this._isShown()) {
      return;
    }
    let activeChildren = [];
    if (this._config.parent) {
      activeChildren = this._getFirstLevelChildren(SELECTOR_ACTIVES).filter((element) => element !== this._element).map((element) => _Collapse.getOrCreateInstance(element, {
        toggle: false
      }));
    }
    if (activeChildren.length && activeChildren[0]._isTransitioning) {
      return;
    }
    const startEvent = EventHandler.trigger(this._element, EVENT_SHOW$6);
    if (startEvent.defaultPrevented) {
      return;
    }
    for (const activeInstance of activeChildren) {
      activeInstance.hide();
    }
    const dimension = this._getDimension();
    this._element.classList.remove(CLASS_NAME_COLLAPSE);
    this._element.classList.add(CLASS_NAME_COLLAPSING);
    this._element.style[dimension] = 0;
    this._addAriaAndCollapsedClass(this._triggerArray, true);
    this._isTransitioning = true;
    const complete = () => {
      this._isTransitioning = false;
      this._element.classList.remove(CLASS_NAME_COLLAPSING);
      this._element.classList.add(CLASS_NAME_COLLAPSE, CLASS_NAME_SHOW$7);
      this._element.style[dimension] = "";
      EventHandler.trigger(this._element, EVENT_SHOWN$6);
    };
    const capitalizedDimension = dimension[0].toUpperCase() + dimension.slice(1);
    const scrollSize = `scroll${capitalizedDimension}`;
    this._queueCallback(complete, this._element, true);
    this._element.style[dimension] = `${this._element[scrollSize]}px`;
  }
  hide() {
    if (this._isTransitioning || !this._isShown()) {
      return;
    }
    const startEvent = EventHandler.trigger(this._element, EVENT_HIDE$6);
    if (startEvent.defaultPrevented) {
      return;
    }
    const dimension = this._getDimension();
    this._element.style[dimension] = `${this._element.getBoundingClientRect()[dimension]}px`;
    reflow(this._element);
    this._element.classList.add(CLASS_NAME_COLLAPSING);
    this._element.classList.remove(CLASS_NAME_COLLAPSE, CLASS_NAME_SHOW$7);
    for (const trigger of this._triggerArray) {
      const element = SelectorEngine.getElementFromSelector(trigger);
      if (element && !this._isShown(element)) {
        this._addAriaAndCollapsedClass([trigger], false);
      }
    }
    this._isTransitioning = true;
    const complete = () => {
      this._isTransitioning = false;
      this._element.classList.remove(CLASS_NAME_COLLAPSING);
      this._element.classList.add(CLASS_NAME_COLLAPSE);
      EventHandler.trigger(this._element, EVENT_HIDDEN$6);
    };
    this._element.style[dimension] = "";
    this._queueCallback(complete, this._element, true);
  }
  _isShown(element = this._element) {
    return element.classList.contains(CLASS_NAME_SHOW$7);
  }
  // Private
  _configAfterMerge(config2) {
    config2.toggle = Boolean(config2.toggle);
    config2.parent = getElement(config2.parent);
    return config2;
  }
  _getDimension() {
    return this._element.classList.contains(CLASS_NAME_HORIZONTAL) ? WIDTH : HEIGHT;
  }
  _initializeChildren() {
    if (!this._config.parent) {
      return;
    }
    const children = this._getFirstLevelChildren(SELECTOR_DATA_TOGGLE$4);
    for (const element of children) {
      const selected = SelectorEngine.getElementFromSelector(element);
      if (selected) {
        this._addAriaAndCollapsedClass([element], this._isShown(selected));
      }
    }
  }
  _getFirstLevelChildren(selector) {
    const children = SelectorEngine.find(CLASS_NAME_DEEPER_CHILDREN, this._config.parent);
    return SelectorEngine.find(selector, this._config.parent).filter((element) => !children.includes(element));
  }
  _addAriaAndCollapsedClass(triggerArray, isOpen) {
    if (!triggerArray.length) {
      return;
    }
    for (const element of triggerArray) {
      element.classList.toggle(CLASS_NAME_COLLAPSED, !isOpen);
      element.setAttribute("aria-expanded", isOpen);
    }
  }
  // Static
  static jQueryInterface(config2) {
    const _config = {};
    if (typeof config2 === "string" && /show|hide/.test(config2)) {
      _config.toggle = false;
    }
    return this.each(function() {
      const data = _Collapse.getOrCreateInstance(this, _config);
      if (typeof config2 === "string") {
        if (typeof data[config2] === "undefined") {
          throw new TypeError(`No method named "${config2}"`);
        }
        data[config2]();
      }
    });
  }
};
EventHandler.on(document, EVENT_CLICK_DATA_API$4, SELECTOR_DATA_TOGGLE$4, function(event) {
  if (event.target.tagName === "A" || event.delegateTarget && event.delegateTarget.tagName === "A") {
    event.preventDefault();
  }
  for (const element of SelectorEngine.getMultipleElementsFromSelector(this)) {
    Collapse.getOrCreateInstance(element, {
      toggle: false
    }).toggle();
  }
});
defineJQueryPlugin(Collapse);
var NAME$a = "dropdown";
var DATA_KEY$6 = "bs.dropdown";
var EVENT_KEY$6 = `.${DATA_KEY$6}`;
var DATA_API_KEY$3 = ".data-api";
var ESCAPE_KEY$2 = "Escape";
var TAB_KEY$1 = "Tab";
var ARROW_UP_KEY$1 = "ArrowUp";
var ARROW_DOWN_KEY$1 = "ArrowDown";
var RIGHT_MOUSE_BUTTON = 2;
var EVENT_HIDE$5 = `hide${EVENT_KEY$6}`;
var EVENT_HIDDEN$5 = `hidden${EVENT_KEY$6}`;
var EVENT_SHOW$5 = `show${EVENT_KEY$6}`;
var EVENT_SHOWN$5 = `shown${EVENT_KEY$6}`;
var EVENT_CLICK_DATA_API$3 = `click${EVENT_KEY$6}${DATA_API_KEY$3}`;
var EVENT_KEYDOWN_DATA_API = `keydown${EVENT_KEY$6}${DATA_API_KEY$3}`;
var EVENT_KEYUP_DATA_API = `keyup${EVENT_KEY$6}${DATA_API_KEY$3}`;
var CLASS_NAME_SHOW$6 = "show";
var CLASS_NAME_DROPUP = "dropup";
var CLASS_NAME_DROPEND = "dropend";
var CLASS_NAME_DROPSTART = "dropstart";
var CLASS_NAME_DROPUP_CENTER = "dropup-center";
var CLASS_NAME_DROPDOWN_CENTER = "dropdown-center";
var SELECTOR_DATA_TOGGLE$3 = '[data-bs-toggle="dropdown"]:not(.disabled):not(:disabled)';
var SELECTOR_DATA_TOGGLE_SHOWN = `${SELECTOR_DATA_TOGGLE$3}.${CLASS_NAME_SHOW$6}`;
var SELECTOR_MENU = ".dropdown-menu";
var SELECTOR_NAVBAR = ".navbar";
var SELECTOR_NAVBAR_NAV = ".navbar-nav";
var SELECTOR_VISIBLE_ITEMS = ".dropdown-menu .dropdown-item:not(.disabled):not(:disabled)";
var PLACEMENT_TOP = isRTL() ? "top-end" : "top-start";
var PLACEMENT_TOPEND = isRTL() ? "top-start" : "top-end";
var PLACEMENT_BOTTOM = isRTL() ? "bottom-end" : "bottom-start";
var PLACEMENT_BOTTOMEND = isRTL() ? "bottom-start" : "bottom-end";
var PLACEMENT_RIGHT = isRTL() ? "left-start" : "right-start";
var PLACEMENT_LEFT = isRTL() ? "right-start" : "left-start";
var PLACEMENT_TOPCENTER = "top";
var PLACEMENT_BOTTOMCENTER = "bottom";
var Default$9 = {
  autoClose: true,
  boundary: "clippingParents",
  display: "dynamic",
  offset: [0, 2],
  popperConfig: null,
  reference: "toggle"
};
var DefaultType$9 = {
  autoClose: "(boolean|string)",
  boundary: "(string|element)",
  display: "string",
  offset: "(array|string|function)",
  popperConfig: "(null|object|function)",
  reference: "(string|element|object)"
};
var Dropdown = class _Dropdown extends BaseComponent {
  constructor(element, config2) {
    super(element, config2);
    this._popper = null;
    this._parent = this._element.parentNode;
    this._menu = SelectorEngine.next(this._element, SELECTOR_MENU)[0] || SelectorEngine.prev(this._element, SELECTOR_MENU)[0] || SelectorEngine.findOne(SELECTOR_MENU, this._parent);
    this._inNavbar = this._detectNavbar();
  }
  // Getters
  static get Default() {
    return Default$9;
  }
  static get DefaultType() {
    return DefaultType$9;
  }
  static get NAME() {
    return NAME$a;
  }
  // Public
  toggle() {
    return this._isShown() ? this.hide() : this.show();
  }
  show() {
    if (isDisabled(this._element) || this._isShown()) {
      return;
    }
    const relatedTarget = {
      relatedTarget: this._element
    };
    const showEvent = EventHandler.trigger(this._element, EVENT_SHOW$5, relatedTarget);
    if (showEvent.defaultPrevented) {
      return;
    }
    this._createPopper();
    if ("ontouchstart" in document.documentElement && !this._parent.closest(SELECTOR_NAVBAR_NAV)) {
      for (const element of [].concat(...document.body.children)) {
        EventHandler.on(element, "mouseover", noop);
      }
    }
    this._element.focus();
    this._element.setAttribute("aria-expanded", true);
    this._menu.classList.add(CLASS_NAME_SHOW$6);
    this._element.classList.add(CLASS_NAME_SHOW$6);
    EventHandler.trigger(this._element, EVENT_SHOWN$5, relatedTarget);
  }
  hide() {
    if (isDisabled(this._element) || !this._isShown()) {
      return;
    }
    const relatedTarget = {
      relatedTarget: this._element
    };
    this._completeHide(relatedTarget);
  }
  dispose() {
    if (this._popper) {
      this._popper.destroy();
    }
    super.dispose();
  }
  update() {
    this._inNavbar = this._detectNavbar();
    if (this._popper) {
      this._popper.update();
    }
  }
  // Private
  _completeHide(relatedTarget) {
    const hideEvent = EventHandler.trigger(this._element, EVENT_HIDE$5, relatedTarget);
    if (hideEvent.defaultPrevented) {
      return;
    }
    if ("ontouchstart" in document.documentElement) {
      for (const element of [].concat(...document.body.children)) {
        EventHandler.off(element, "mouseover", noop);
      }
    }
    if (this._popper) {
      this._popper.destroy();
    }
    this._menu.classList.remove(CLASS_NAME_SHOW$6);
    this._element.classList.remove(CLASS_NAME_SHOW$6);
    this._element.setAttribute("aria-expanded", "false");
    Manipulator.removeDataAttribute(this._menu, "popper");
    EventHandler.trigger(this._element, EVENT_HIDDEN$5, relatedTarget);
  }
  _getConfig(config2) {
    config2 = super._getConfig(config2);
    if (typeof config2.reference === "object" && !isElement2(config2.reference) && typeof config2.reference.getBoundingClientRect !== "function") {
      throw new TypeError(`${NAME$a.toUpperCase()}: Option "reference" provided type "object" without a required "getBoundingClientRect" method.`);
    }
    return config2;
  }
  _createPopper() {
    if (typeof lib_exports === "undefined") {
      throw new TypeError("Bootstrap's dropdowns require Popper (https://popper.js.org/docs/v2/)");
    }
    let referenceElement = this._element;
    if (this._config.reference === "parent") {
      referenceElement = this._parent;
    } else if (isElement2(this._config.reference)) {
      referenceElement = getElement(this._config.reference);
    } else if (typeof this._config.reference === "object") {
      referenceElement = this._config.reference;
    }
    const popperConfig = this._getPopperConfig();
    this._popper = createPopper3(referenceElement, this._menu, popperConfig);
  }
  _isShown() {
    return this._menu.classList.contains(CLASS_NAME_SHOW$6);
  }
  _getPlacement() {
    const parentDropdown = this._parent;
    if (parentDropdown.classList.contains(CLASS_NAME_DROPEND)) {
      return PLACEMENT_RIGHT;
    }
    if (parentDropdown.classList.contains(CLASS_NAME_DROPSTART)) {
      return PLACEMENT_LEFT;
    }
    if (parentDropdown.classList.contains(CLASS_NAME_DROPUP_CENTER)) {
      return PLACEMENT_TOPCENTER;
    }
    if (parentDropdown.classList.contains(CLASS_NAME_DROPDOWN_CENTER)) {
      return PLACEMENT_BOTTOMCENTER;
    }
    const isEnd = getComputedStyle(this._menu).getPropertyValue("--bs-position").trim() === "end";
    if (parentDropdown.classList.contains(CLASS_NAME_DROPUP)) {
      return isEnd ? PLACEMENT_TOPEND : PLACEMENT_TOP;
    }
    return isEnd ? PLACEMENT_BOTTOMEND : PLACEMENT_BOTTOM;
  }
  _detectNavbar() {
    return this._element.closest(SELECTOR_NAVBAR) !== null;
  }
  _getOffset() {
    const {
      offset: offset2
    } = this._config;
    if (typeof offset2 === "string") {
      return offset2.split(",").map((value) => Number.parseInt(value, 10));
    }
    if (typeof offset2 === "function") {
      return (popperData) => offset2(popperData, this._element);
    }
    return offset2;
  }
  _getPopperConfig() {
    const defaultBsPopperConfig = {
      placement: this._getPlacement(),
      modifiers: [{
        name: "preventOverflow",
        options: {
          boundary: this._config.boundary
        }
      }, {
        name: "offset",
        options: {
          offset: this._getOffset()
        }
      }]
    };
    if (this._inNavbar || this._config.display === "static") {
      Manipulator.setDataAttribute(this._menu, "popper", "static");
      defaultBsPopperConfig.modifiers = [{
        name: "applyStyles",
        enabled: false
      }];
    }
    return {
      ...defaultBsPopperConfig,
      ...execute(this._config.popperConfig, [void 0, defaultBsPopperConfig])
    };
  }
  _selectMenuItem({
    key,
    target
  }) {
    const items = SelectorEngine.find(SELECTOR_VISIBLE_ITEMS, this._menu).filter((element) => isVisible(element));
    if (!items.length) {
      return;
    }
    getNextActiveElement(items, target, key === ARROW_DOWN_KEY$1, !items.includes(target)).focus();
  }
  // Static
  static jQueryInterface(config2) {
    return this.each(function() {
      const data = _Dropdown.getOrCreateInstance(this, config2);
      if (typeof config2 !== "string") {
        return;
      }
      if (typeof data[config2] === "undefined") {
        throw new TypeError(`No method named "${config2}"`);
      }
      data[config2]();
    });
  }
  static clearMenus(event) {
    if (event.button === RIGHT_MOUSE_BUTTON || event.type === "keyup" && event.key !== TAB_KEY$1) {
      return;
    }
    const openToggles = SelectorEngine.find(SELECTOR_DATA_TOGGLE_SHOWN);
    for (const toggle of openToggles) {
      const context = _Dropdown.getInstance(toggle);
      if (!context || context._config.autoClose === false) {
        continue;
      }
      const composedPath = event.composedPath();
      const isMenuTarget = composedPath.includes(context._menu);
      if (composedPath.includes(context._element) || context._config.autoClose === "inside" && !isMenuTarget || context._config.autoClose === "outside" && isMenuTarget) {
        continue;
      }
      if (context._menu.contains(event.target) && (event.type === "keyup" && event.key === TAB_KEY$1 || /input|select|option|textarea|form/i.test(event.target.tagName))) {
        continue;
      }
      const relatedTarget = {
        relatedTarget: context._element
      };
      if (event.type === "click") {
        relatedTarget.clickEvent = event;
      }
      context._completeHide(relatedTarget);
    }
  }
  static dataApiKeydownHandler(event) {
    const isInput = /input|textarea/i.test(event.target.tagName);
    const isEscapeEvent = event.key === ESCAPE_KEY$2;
    const isUpOrDownEvent = [ARROW_UP_KEY$1, ARROW_DOWN_KEY$1].includes(event.key);
    if (!isUpOrDownEvent && !isEscapeEvent) {
      return;
    }
    if (isInput && !isEscapeEvent) {
      return;
    }
    event.preventDefault();
    const getToggleButton = this.matches(SELECTOR_DATA_TOGGLE$3) ? this : SelectorEngine.prev(this, SELECTOR_DATA_TOGGLE$3)[0] || SelectorEngine.next(this, SELECTOR_DATA_TOGGLE$3)[0] || SelectorEngine.findOne(SELECTOR_DATA_TOGGLE$3, event.delegateTarget.parentNode);
    const instance = _Dropdown.getOrCreateInstance(getToggleButton);
    if (isUpOrDownEvent) {
      event.stopPropagation();
      instance.show();
      instance._selectMenuItem(event);
      return;
    }
    if (instance._isShown()) {
      event.stopPropagation();
      instance.hide();
      getToggleButton.focus();
    }
  }
};
EventHandler.on(document, EVENT_KEYDOWN_DATA_API, SELECTOR_DATA_TOGGLE$3, Dropdown.dataApiKeydownHandler);
EventHandler.on(document, EVENT_KEYDOWN_DATA_API, SELECTOR_MENU, Dropdown.dataApiKeydownHandler);
EventHandler.on(document, EVENT_CLICK_DATA_API$3, Dropdown.clearMenus);
EventHandler.on(document, EVENT_KEYUP_DATA_API, Dropdown.clearMenus);
EventHandler.on(document, EVENT_CLICK_DATA_API$3, SELECTOR_DATA_TOGGLE$3, function(event) {
  event.preventDefault();
  Dropdown.getOrCreateInstance(this).toggle();
});
defineJQueryPlugin(Dropdown);
var NAME$9 = "backdrop";
var CLASS_NAME_FADE$4 = "fade";
var CLASS_NAME_SHOW$5 = "show";
var EVENT_MOUSEDOWN = `mousedown.bs.${NAME$9}`;
var Default$8 = {
  className: "modal-backdrop",
  clickCallback: null,
  isAnimated: false,
  isVisible: true,
  // if false, we use the backdrop helper without adding any element to the dom
  rootElement: "body"
  // give the choice to place backdrop under different elements
};
var DefaultType$8 = {
  className: "string",
  clickCallback: "(function|null)",
  isAnimated: "boolean",
  isVisible: "boolean",
  rootElement: "(element|string)"
};
var Backdrop = class extends Config2 {
  constructor(config2) {
    super();
    this._config = this._getConfig(config2);
    this._isAppended = false;
    this._element = null;
  }
  // Getters
  static get Default() {
    return Default$8;
  }
  static get DefaultType() {
    return DefaultType$8;
  }
  static get NAME() {
    return NAME$9;
  }
  // Public
  show(callback) {
    if (!this._config.isVisible) {
      execute(callback);
      return;
    }
    this._append();
    const element = this._getElement();
    if (this._config.isAnimated) {
      reflow(element);
    }
    element.classList.add(CLASS_NAME_SHOW$5);
    this._emulateAnimation(() => {
      execute(callback);
    });
  }
  hide(callback) {
    if (!this._config.isVisible) {
      execute(callback);
      return;
    }
    this._getElement().classList.remove(CLASS_NAME_SHOW$5);
    this._emulateAnimation(() => {
      this.dispose();
      execute(callback);
    });
  }
  dispose() {
    if (!this._isAppended) {
      return;
    }
    EventHandler.off(this._element, EVENT_MOUSEDOWN);
    this._element.remove();
    this._isAppended = false;
  }
  // Private
  _getElement() {
    if (!this._element) {
      const backdrop = document.createElement("div");
      backdrop.className = this._config.className;
      if (this._config.isAnimated) {
        backdrop.classList.add(CLASS_NAME_FADE$4);
      }
      this._element = backdrop;
    }
    return this._element;
  }
  _configAfterMerge(config2) {
    config2.rootElement = getElement(config2.rootElement);
    return config2;
  }
  _append() {
    if (this._isAppended) {
      return;
    }
    const element = this._getElement();
    this._config.rootElement.append(element);
    EventHandler.on(element, EVENT_MOUSEDOWN, () => {
      execute(this._config.clickCallback);
    });
    this._isAppended = true;
  }
  _emulateAnimation(callback) {
    executeAfterTransition(callback, this._getElement(), this._config.isAnimated);
  }
};
var NAME$8 = "focustrap";
var DATA_KEY$5 = "bs.focustrap";
var EVENT_KEY$5 = `.${DATA_KEY$5}`;
var EVENT_FOCUSIN$2 = `focusin${EVENT_KEY$5}`;
var EVENT_KEYDOWN_TAB = `keydown.tab${EVENT_KEY$5}`;
var TAB_KEY = "Tab";
var TAB_NAV_FORWARD = "forward";
var TAB_NAV_BACKWARD = "backward";
var Default$7 = {
  autofocus: true,
  trapElement: null
  // The element to trap focus inside of
};
var DefaultType$7 = {
  autofocus: "boolean",
  trapElement: "element"
};
var FocusTrap = class extends Config2 {
  constructor(config2) {
    super();
    this._config = this._getConfig(config2);
    this._isActive = false;
    this._lastTabNavDirection = null;
  }
  // Getters
  static get Default() {
    return Default$7;
  }
  static get DefaultType() {
    return DefaultType$7;
  }
  static get NAME() {
    return NAME$8;
  }
  // Public
  activate() {
    if (this._isActive) {
      return;
    }
    if (this._config.autofocus) {
      this._config.trapElement.focus();
    }
    EventHandler.off(document, EVENT_KEY$5);
    EventHandler.on(document, EVENT_FOCUSIN$2, (event) => this._handleFocusin(event));
    EventHandler.on(document, EVENT_KEYDOWN_TAB, (event) => this._handleKeydown(event));
    this._isActive = true;
  }
  deactivate() {
    if (!this._isActive) {
      return;
    }
    this._isActive = false;
    EventHandler.off(document, EVENT_KEY$5);
  }
  // Private
  _handleFocusin(event) {
    const {
      trapElement
    } = this._config;
    if (event.target === document || event.target === trapElement || trapElement.contains(event.target)) {
      return;
    }
    const elements = SelectorEngine.focusableChildren(trapElement);
    if (elements.length === 0) {
      trapElement.focus();
    } else if (this._lastTabNavDirection === TAB_NAV_BACKWARD) {
      elements[elements.length - 1].focus();
    } else {
      elements[0].focus();
    }
  }
  _handleKeydown(event) {
    if (event.key !== TAB_KEY) {
      return;
    }
    this._lastTabNavDirection = event.shiftKey ? TAB_NAV_BACKWARD : TAB_NAV_FORWARD;
  }
};
var SELECTOR_FIXED_CONTENT = ".fixed-top, .fixed-bottom, .is-fixed, .sticky-top";
var SELECTOR_STICKY_CONTENT = ".sticky-top";
var PROPERTY_PADDING = "padding-right";
var PROPERTY_MARGIN = "margin-right";
var ScrollBarHelper = class {
  constructor() {
    this._element = document.body;
  }
  // Public
  getWidth() {
    const documentWidth = document.documentElement.clientWidth;
    return Math.abs(window.innerWidth - documentWidth);
  }
  hide() {
    const width = this.getWidth();
    this._disableOverFlow();
    this._setElementAttributes(this._element, PROPERTY_PADDING, (calculatedValue) => calculatedValue + width);
    this._setElementAttributes(SELECTOR_FIXED_CONTENT, PROPERTY_PADDING, (calculatedValue) => calculatedValue + width);
    this._setElementAttributes(SELECTOR_STICKY_CONTENT, PROPERTY_MARGIN, (calculatedValue) => calculatedValue - width);
  }
  reset() {
    this._resetElementAttributes(this._element, "overflow");
    this._resetElementAttributes(this._element, PROPERTY_PADDING);
    this._resetElementAttributes(SELECTOR_FIXED_CONTENT, PROPERTY_PADDING);
    this._resetElementAttributes(SELECTOR_STICKY_CONTENT, PROPERTY_MARGIN);
  }
  isOverflowing() {
    return this.getWidth() > 0;
  }
  // Private
  _disableOverFlow() {
    this._saveInitialAttribute(this._element, "overflow");
    this._element.style.overflow = "hidden";
  }
  _setElementAttributes(selector, styleProperty, callback) {
    const scrollbarWidth = this.getWidth();
    const manipulationCallBack = (element) => {
      if (element !== this._element && window.innerWidth > element.clientWidth + scrollbarWidth) {
        return;
      }
      this._saveInitialAttribute(element, styleProperty);
      const calculatedValue = window.getComputedStyle(element).getPropertyValue(styleProperty);
      element.style.setProperty(styleProperty, `${callback(Number.parseFloat(calculatedValue))}px`);
    };
    this._applyManipulationCallback(selector, manipulationCallBack);
  }
  _saveInitialAttribute(element, styleProperty) {
    const actualValue = element.style.getPropertyValue(styleProperty);
    if (actualValue) {
      Manipulator.setDataAttribute(element, styleProperty, actualValue);
    }
  }
  _resetElementAttributes(selector, styleProperty) {
    const manipulationCallBack = (element) => {
      const value = Manipulator.getDataAttribute(element, styleProperty);
      if (value === null) {
        element.style.removeProperty(styleProperty);
        return;
      }
      Manipulator.removeDataAttribute(element, styleProperty);
      element.style.setProperty(styleProperty, value);
    };
    this._applyManipulationCallback(selector, manipulationCallBack);
  }
  _applyManipulationCallback(selector, callBack) {
    if (isElement2(selector)) {
      callBack(selector);
      return;
    }
    for (const sel of SelectorEngine.find(selector, this._element)) {
      callBack(sel);
    }
  }
};
var NAME$7 = "modal";
var DATA_KEY$4 = "bs.modal";
var EVENT_KEY$4 = `.${DATA_KEY$4}`;
var DATA_API_KEY$2 = ".data-api";
var ESCAPE_KEY$1 = "Escape";
var EVENT_HIDE$4 = `hide${EVENT_KEY$4}`;
var EVENT_HIDE_PREVENTED$1 = `hidePrevented${EVENT_KEY$4}`;
var EVENT_HIDDEN$4 = `hidden${EVENT_KEY$4}`;
var EVENT_SHOW$4 = `show${EVENT_KEY$4}`;
var EVENT_SHOWN$4 = `shown${EVENT_KEY$4}`;
var EVENT_RESIZE$1 = `resize${EVENT_KEY$4}`;
var EVENT_CLICK_DISMISS = `click.dismiss${EVENT_KEY$4}`;
var EVENT_MOUSEDOWN_DISMISS = `mousedown.dismiss${EVENT_KEY$4}`;
var EVENT_KEYDOWN_DISMISS$1 = `keydown.dismiss${EVENT_KEY$4}`;
var EVENT_CLICK_DATA_API$2 = `click${EVENT_KEY$4}${DATA_API_KEY$2}`;
var CLASS_NAME_OPEN = "modal-open";
var CLASS_NAME_FADE$3 = "fade";
var CLASS_NAME_SHOW$4 = "show";
var CLASS_NAME_STATIC = "modal-static";
var OPEN_SELECTOR$1 = ".modal.show";
var SELECTOR_DIALOG = ".modal-dialog";
var SELECTOR_MODAL_BODY = ".modal-body";
var SELECTOR_DATA_TOGGLE$2 = '[data-bs-toggle="modal"]';
var Default$6 = {
  backdrop: true,
  focus: true,
  keyboard: true
};
var DefaultType$6 = {
  backdrop: "(boolean|string)",
  focus: "boolean",
  keyboard: "boolean"
};
var Modal = class _Modal extends BaseComponent {
  constructor(element, config2) {
    super(element, config2);
    this._dialog = SelectorEngine.findOne(SELECTOR_DIALOG, this._element);
    this._backdrop = this._initializeBackDrop();
    this._focustrap = this._initializeFocusTrap();
    this._isShown = false;
    this._isTransitioning = false;
    this._scrollBar = new ScrollBarHelper();
    this._addEventListeners();
  }
  // Getters
  static get Default() {
    return Default$6;
  }
  static get DefaultType() {
    return DefaultType$6;
  }
  static get NAME() {
    return NAME$7;
  }
  // Public
  toggle(relatedTarget) {
    return this._isShown ? this.hide() : this.show(relatedTarget);
  }
  show(relatedTarget) {
    if (this._isShown || this._isTransitioning) {
      return;
    }
    const showEvent = EventHandler.trigger(this._element, EVENT_SHOW$4, {
      relatedTarget
    });
    if (showEvent.defaultPrevented) {
      return;
    }
    this._isShown = true;
    this._isTransitioning = true;
    this._scrollBar.hide();
    document.body.classList.add(CLASS_NAME_OPEN);
    this._adjustDialog();
    this._backdrop.show(() => this._showElement(relatedTarget));
  }
  hide() {
    if (!this._isShown || this._isTransitioning) {
      return;
    }
    const hideEvent = EventHandler.trigger(this._element, EVENT_HIDE$4);
    if (hideEvent.defaultPrevented) {
      return;
    }
    this._isShown = false;
    this._isTransitioning = true;
    this._focustrap.deactivate();
    this._element.classList.remove(CLASS_NAME_SHOW$4);
    this._queueCallback(() => this._hideModal(), this._element, this._isAnimated());
  }
  dispose() {
    EventHandler.off(window, EVENT_KEY$4);
    EventHandler.off(this._dialog, EVENT_KEY$4);
    this._backdrop.dispose();
    this._focustrap.deactivate();
    super.dispose();
  }
  handleUpdate() {
    this._adjustDialog();
  }
  // Private
  _initializeBackDrop() {
    return new Backdrop({
      isVisible: Boolean(this._config.backdrop),
      // 'static' option will be translated to true, and booleans will keep their value,
      isAnimated: this._isAnimated()
    });
  }
  _initializeFocusTrap() {
    return new FocusTrap({
      trapElement: this._element
    });
  }
  _showElement(relatedTarget) {
    if (!document.body.contains(this._element)) {
      document.body.append(this._element);
    }
    this._element.style.display = "block";
    this._element.removeAttribute("aria-hidden");
    this._element.setAttribute("aria-modal", true);
    this._element.setAttribute("role", "dialog");
    this._element.scrollTop = 0;
    const modalBody = SelectorEngine.findOne(SELECTOR_MODAL_BODY, this._dialog);
    if (modalBody) {
      modalBody.scrollTop = 0;
    }
    reflow(this._element);
    this._element.classList.add(CLASS_NAME_SHOW$4);
    const transitionComplete = () => {
      if (this._config.focus) {
        this._focustrap.activate();
      }
      this._isTransitioning = false;
      EventHandler.trigger(this._element, EVENT_SHOWN$4, {
        relatedTarget
      });
    };
    this._queueCallback(transitionComplete, this._dialog, this._isAnimated());
  }
  _addEventListeners() {
    EventHandler.on(this._element, EVENT_KEYDOWN_DISMISS$1, (event) => {
      if (event.key !== ESCAPE_KEY$1) {
        return;
      }
      if (this._config.keyboard) {
        this.hide();
        return;
      }
      this._triggerBackdropTransition();
    });
    EventHandler.on(window, EVENT_RESIZE$1, () => {
      if (this._isShown && !this._isTransitioning) {
        this._adjustDialog();
      }
    });
    EventHandler.on(this._element, EVENT_MOUSEDOWN_DISMISS, (event) => {
      EventHandler.one(this._element, EVENT_CLICK_DISMISS, (event2) => {
        if (this._element !== event.target || this._element !== event2.target) {
          return;
        }
        if (this._config.backdrop === "static") {
          this._triggerBackdropTransition();
          return;
        }
        if (this._config.backdrop) {
          this.hide();
        }
      });
    });
  }
  _hideModal() {
    this._element.style.display = "none";
    this._element.setAttribute("aria-hidden", true);
    this._element.removeAttribute("aria-modal");
    this._element.removeAttribute("role");
    this._isTransitioning = false;
    this._backdrop.hide(() => {
      document.body.classList.remove(CLASS_NAME_OPEN);
      this._resetAdjustments();
      this._scrollBar.reset();
      EventHandler.trigger(this._element, EVENT_HIDDEN$4);
    });
  }
  _isAnimated() {
    return this._element.classList.contains(CLASS_NAME_FADE$3);
  }
  _triggerBackdropTransition() {
    const hideEvent = EventHandler.trigger(this._element, EVENT_HIDE_PREVENTED$1);
    if (hideEvent.defaultPrevented) {
      return;
    }
    const isModalOverflowing = this._element.scrollHeight > document.documentElement.clientHeight;
    const initialOverflowY = this._element.style.overflowY;
    if (initialOverflowY === "hidden" || this._element.classList.contains(CLASS_NAME_STATIC)) {
      return;
    }
    if (!isModalOverflowing) {
      this._element.style.overflowY = "hidden";
    }
    this._element.classList.add(CLASS_NAME_STATIC);
    this._queueCallback(() => {
      this._element.classList.remove(CLASS_NAME_STATIC);
      this._queueCallback(() => {
        this._element.style.overflowY = initialOverflowY;
      }, this._dialog);
    }, this._dialog);
    this._element.focus();
  }
  /**
   * The following methods are used to handle overflowing modals
   */
  _adjustDialog() {
    const isModalOverflowing = this._element.scrollHeight > document.documentElement.clientHeight;
    const scrollbarWidth = this._scrollBar.getWidth();
    const isBodyOverflowing = scrollbarWidth > 0;
    if (isBodyOverflowing && !isModalOverflowing) {
      const property = isRTL() ? "paddingLeft" : "paddingRight";
      this._element.style[property] = `${scrollbarWidth}px`;
    }
    if (!isBodyOverflowing && isModalOverflowing) {
      const property = isRTL() ? "paddingRight" : "paddingLeft";
      this._element.style[property] = `${scrollbarWidth}px`;
    }
  }
  _resetAdjustments() {
    this._element.style.paddingLeft = "";
    this._element.style.paddingRight = "";
  }
  // Static
  static jQueryInterface(config2, relatedTarget) {
    return this.each(function() {
      const data = _Modal.getOrCreateInstance(this, config2);
      if (typeof config2 !== "string") {
        return;
      }
      if (typeof data[config2] === "undefined") {
        throw new TypeError(`No method named "${config2}"`);
      }
      data[config2](relatedTarget);
    });
  }
};
EventHandler.on(document, EVENT_CLICK_DATA_API$2, SELECTOR_DATA_TOGGLE$2, function(event) {
  const target = SelectorEngine.getElementFromSelector(this);
  if (["A", "AREA"].includes(this.tagName)) {
    event.preventDefault();
  }
  EventHandler.one(target, EVENT_SHOW$4, (showEvent) => {
    if (showEvent.defaultPrevented) {
      return;
    }
    EventHandler.one(target, EVENT_HIDDEN$4, () => {
      if (isVisible(this)) {
        this.focus();
      }
    });
  });
  const alreadyOpen = SelectorEngine.findOne(OPEN_SELECTOR$1);
  if (alreadyOpen) {
    Modal.getInstance(alreadyOpen).hide();
  }
  const data = Modal.getOrCreateInstance(target);
  data.toggle(this);
});
enableDismissTrigger(Modal);
defineJQueryPlugin(Modal);
var NAME$6 = "offcanvas";
var DATA_KEY$3 = "bs.offcanvas";
var EVENT_KEY$3 = `.${DATA_KEY$3}`;
var DATA_API_KEY$1 = ".data-api";
var EVENT_LOAD_DATA_API$2 = `load${EVENT_KEY$3}${DATA_API_KEY$1}`;
var ESCAPE_KEY = "Escape";
var CLASS_NAME_SHOW$3 = "show";
var CLASS_NAME_SHOWING$1 = "showing";
var CLASS_NAME_HIDING = "hiding";
var CLASS_NAME_BACKDROP = "offcanvas-backdrop";
var OPEN_SELECTOR = ".offcanvas.show";
var EVENT_SHOW$3 = `show${EVENT_KEY$3}`;
var EVENT_SHOWN$3 = `shown${EVENT_KEY$3}`;
var EVENT_HIDE$3 = `hide${EVENT_KEY$3}`;
var EVENT_HIDE_PREVENTED = `hidePrevented${EVENT_KEY$3}`;
var EVENT_HIDDEN$3 = `hidden${EVENT_KEY$3}`;
var EVENT_RESIZE = `resize${EVENT_KEY$3}`;
var EVENT_CLICK_DATA_API$1 = `click${EVENT_KEY$3}${DATA_API_KEY$1}`;
var EVENT_KEYDOWN_DISMISS = `keydown.dismiss${EVENT_KEY$3}`;
var SELECTOR_DATA_TOGGLE$1 = '[data-bs-toggle="offcanvas"]';
var Default$5 = {
  backdrop: true,
  keyboard: true,
  scroll: false
};
var DefaultType$5 = {
  backdrop: "(boolean|string)",
  keyboard: "boolean",
  scroll: "boolean"
};
var Offcanvas = class _Offcanvas extends BaseComponent {
  constructor(element, config2) {
    super(element, config2);
    this._isShown = false;
    this._backdrop = this._initializeBackDrop();
    this._focustrap = this._initializeFocusTrap();
    this._addEventListeners();
  }
  // Getters
  static get Default() {
    return Default$5;
  }
  static get DefaultType() {
    return DefaultType$5;
  }
  static get NAME() {
    return NAME$6;
  }
  // Public
  toggle(relatedTarget) {
    return this._isShown ? this.hide() : this.show(relatedTarget);
  }
  show(relatedTarget) {
    if (this._isShown) {
      return;
    }
    const showEvent = EventHandler.trigger(this._element, EVENT_SHOW$3, {
      relatedTarget
    });
    if (showEvent.defaultPrevented) {
      return;
    }
    this._isShown = true;
    this._backdrop.show();
    if (!this._config.scroll) {
      new ScrollBarHelper().hide();
    }
    this._element.setAttribute("aria-modal", true);
    this._element.setAttribute("role", "dialog");
    this._element.classList.add(CLASS_NAME_SHOWING$1);
    const completeCallBack = () => {
      if (!this._config.scroll || this._config.backdrop) {
        this._focustrap.activate();
      }
      this._element.classList.add(CLASS_NAME_SHOW$3);
      this._element.classList.remove(CLASS_NAME_SHOWING$1);
      EventHandler.trigger(this._element, EVENT_SHOWN$3, {
        relatedTarget
      });
    };
    this._queueCallback(completeCallBack, this._element, true);
  }
  hide() {
    if (!this._isShown) {
      return;
    }
    const hideEvent = EventHandler.trigger(this._element, EVENT_HIDE$3);
    if (hideEvent.defaultPrevented) {
      return;
    }
    this._focustrap.deactivate();
    this._element.blur();
    this._isShown = false;
    this._element.classList.add(CLASS_NAME_HIDING);
    this._backdrop.hide();
    const completeCallback = () => {
      this._element.classList.remove(CLASS_NAME_SHOW$3, CLASS_NAME_HIDING);
      this._element.removeAttribute("aria-modal");
      this._element.removeAttribute("role");
      if (!this._config.scroll) {
        new ScrollBarHelper().reset();
      }
      EventHandler.trigger(this._element, EVENT_HIDDEN$3);
    };
    this._queueCallback(completeCallback, this._element, true);
  }
  dispose() {
    this._backdrop.dispose();
    this._focustrap.deactivate();
    super.dispose();
  }
  // Private
  _initializeBackDrop() {
    const clickCallback = () => {
      if (this._config.backdrop === "static") {
        EventHandler.trigger(this._element, EVENT_HIDE_PREVENTED);
        return;
      }
      this.hide();
    };
    const isVisible2 = Boolean(this._config.backdrop);
    return new Backdrop({
      className: CLASS_NAME_BACKDROP,
      isVisible: isVisible2,
      isAnimated: true,
      rootElement: this._element.parentNode,
      clickCallback: isVisible2 ? clickCallback : null
    });
  }
  _initializeFocusTrap() {
    return new FocusTrap({
      trapElement: this._element
    });
  }
  _addEventListeners() {
    EventHandler.on(this._element, EVENT_KEYDOWN_DISMISS, (event) => {
      if (event.key !== ESCAPE_KEY) {
        return;
      }
      if (this._config.keyboard) {
        this.hide();
        return;
      }
      EventHandler.trigger(this._element, EVENT_HIDE_PREVENTED);
    });
  }
  // Static
  static jQueryInterface(config2) {
    return this.each(function() {
      const data = _Offcanvas.getOrCreateInstance(this, config2);
      if (typeof config2 !== "string") {
        return;
      }
      if (data[config2] === void 0 || config2.startsWith("_") || config2 === "constructor") {
        throw new TypeError(`No method named "${config2}"`);
      }
      data[config2](this);
    });
  }
};
EventHandler.on(document, EVENT_CLICK_DATA_API$1, SELECTOR_DATA_TOGGLE$1, function(event) {
  const target = SelectorEngine.getElementFromSelector(this);
  if (["A", "AREA"].includes(this.tagName)) {
    event.preventDefault();
  }
  if (isDisabled(this)) {
    return;
  }
  EventHandler.one(target, EVENT_HIDDEN$3, () => {
    if (isVisible(this)) {
      this.focus();
    }
  });
  const alreadyOpen = SelectorEngine.findOne(OPEN_SELECTOR);
  if (alreadyOpen && alreadyOpen !== target) {
    Offcanvas.getInstance(alreadyOpen).hide();
  }
  const data = Offcanvas.getOrCreateInstance(target);
  data.toggle(this);
});
EventHandler.on(window, EVENT_LOAD_DATA_API$2, () => {
  for (const selector of SelectorEngine.find(OPEN_SELECTOR)) {
    Offcanvas.getOrCreateInstance(selector).show();
  }
});
EventHandler.on(window, EVENT_RESIZE, () => {
  for (const element of SelectorEngine.find("[aria-modal][class*=show][class*=offcanvas-]")) {
    if (getComputedStyle(element).position !== "fixed") {
      Offcanvas.getOrCreateInstance(element).hide();
    }
  }
});
enableDismissTrigger(Offcanvas);
defineJQueryPlugin(Offcanvas);
var ARIA_ATTRIBUTE_PATTERN = /^aria-[\w-]*$/i;
var DefaultAllowlist = {
  // Global attributes allowed on any supplied element below.
  "*": ["class", "dir", "id", "lang", "role", ARIA_ATTRIBUTE_PATTERN],
  a: ["target", "href", "title", "rel"],
  area: [],
  b: [],
  br: [],
  col: [],
  code: [],
  dd: [],
  div: [],
  dl: [],
  dt: [],
  em: [],
  hr: [],
  h1: [],
  h2: [],
  h3: [],
  h4: [],
  h5: [],
  h6: [],
  i: [],
  img: ["src", "srcset", "alt", "title", "width", "height"],
  li: [],
  ol: [],
  p: [],
  pre: [],
  s: [],
  small: [],
  span: [],
  sub: [],
  sup: [],
  strong: [],
  u: [],
  ul: []
};
var uriAttributes = /* @__PURE__ */ new Set(["background", "cite", "href", "itemtype", "longdesc", "poster", "src", "xlink:href"]);
var SAFE_URL_PATTERN = /^(?!javascript:)(?:[a-z0-9+.-]+:|[^&:/?#]*(?:[/?#]|$))/i;
var allowedAttribute = (attribute, allowedAttributeList) => {
  const attributeName = attribute.nodeName.toLowerCase();
  if (allowedAttributeList.includes(attributeName)) {
    if (uriAttributes.has(attributeName)) {
      return Boolean(SAFE_URL_PATTERN.test(attribute.nodeValue));
    }
    return true;
  }
  return allowedAttributeList.filter((attributeRegex) => attributeRegex instanceof RegExp).some((regex) => regex.test(attributeName));
};
function sanitizeHtml(unsafeHtml, allowList, sanitizeFunction) {
  if (!unsafeHtml.length) {
    return unsafeHtml;
  }
  if (sanitizeFunction && typeof sanitizeFunction === "function") {
    return sanitizeFunction(unsafeHtml);
  }
  const domParser = new window.DOMParser();
  const createdDocument = domParser.parseFromString(unsafeHtml, "text/html");
  const elements = [].concat(...createdDocument.body.querySelectorAll("*"));
  for (const element of elements) {
    const elementName = element.nodeName.toLowerCase();
    if (!Object.keys(allowList).includes(elementName)) {
      element.remove();
      continue;
    }
    const attributeList = [].concat(...element.attributes);
    const allowedAttributes = [].concat(allowList["*"] || [], allowList[elementName] || []);
    for (const attribute of attributeList) {
      if (!allowedAttribute(attribute, allowedAttributes)) {
        element.removeAttribute(attribute.nodeName);
      }
    }
  }
  return createdDocument.body.innerHTML;
}
var NAME$5 = "TemplateFactory";
var Default$4 = {
  allowList: DefaultAllowlist,
  content: {},
  // { selector : text ,  selector2 : text2 , }
  extraClass: "",
  html: false,
  sanitize: true,
  sanitizeFn: null,
  template: "<div></div>"
};
var DefaultType$4 = {
  allowList: "object",
  content: "object",
  extraClass: "(string|function)",
  html: "boolean",
  sanitize: "boolean",
  sanitizeFn: "(null|function)",
  template: "string"
};
var DefaultContentType = {
  entry: "(string|element|function|null)",
  selector: "(string|element)"
};
var TemplateFactory = class extends Config2 {
  constructor(config2) {
    super();
    this._config = this._getConfig(config2);
  }
  // Getters
  static get Default() {
    return Default$4;
  }
  static get DefaultType() {
    return DefaultType$4;
  }
  static get NAME() {
    return NAME$5;
  }
  // Public
  getContent() {
    return Object.values(this._config.content).map((config2) => this._resolvePossibleFunction(config2)).filter(Boolean);
  }
  hasContent() {
    return this.getContent().length > 0;
  }
  changeContent(content) {
    this._checkContent(content);
    this._config.content = {
      ...this._config.content,
      ...content
    };
    return this;
  }
  toHtml() {
    const templateWrapper = document.createElement("div");
    templateWrapper.innerHTML = this._maybeSanitize(this._config.template);
    for (const [selector, text] of Object.entries(this._config.content)) {
      this._setContent(templateWrapper, text, selector);
    }
    const template = templateWrapper.children[0];
    const extraClass = this._resolvePossibleFunction(this._config.extraClass);
    if (extraClass) {
      template.classList.add(...extraClass.split(" "));
    }
    return template;
  }
  // Private
  _typeCheckConfig(config2) {
    super._typeCheckConfig(config2);
    this._checkContent(config2.content);
  }
  _checkContent(arg) {
    for (const [selector, content] of Object.entries(arg)) {
      super._typeCheckConfig({
        selector,
        entry: content
      }, DefaultContentType);
    }
  }
  _setContent(template, content, selector) {
    const templateElement = SelectorEngine.findOne(selector, template);
    if (!templateElement) {
      return;
    }
    content = this._resolvePossibleFunction(content);
    if (!content) {
      templateElement.remove();
      return;
    }
    if (isElement2(content)) {
      this._putElementInTemplate(getElement(content), templateElement);
      return;
    }
    if (this._config.html) {
      templateElement.innerHTML = this._maybeSanitize(content);
      return;
    }
    templateElement.textContent = content;
  }
  _maybeSanitize(arg) {
    return this._config.sanitize ? sanitizeHtml(arg, this._config.allowList, this._config.sanitizeFn) : arg;
  }
  _resolvePossibleFunction(arg) {
    return execute(arg, [void 0, this]);
  }
  _putElementInTemplate(element, templateElement) {
    if (this._config.html) {
      templateElement.innerHTML = "";
      templateElement.append(element);
      return;
    }
    templateElement.textContent = element.textContent;
  }
};
var NAME$4 = "tooltip";
var DISALLOWED_ATTRIBUTES = /* @__PURE__ */ new Set(["sanitize", "allowList", "sanitizeFn"]);
var CLASS_NAME_FADE$2 = "fade";
var CLASS_NAME_MODAL = "modal";
var CLASS_NAME_SHOW$2 = "show";
var SELECTOR_TOOLTIP_INNER = ".tooltip-inner";
var SELECTOR_MODAL = `.${CLASS_NAME_MODAL}`;
var EVENT_MODAL_HIDE = "hide.bs.modal";
var TRIGGER_HOVER = "hover";
var TRIGGER_FOCUS = "focus";
var TRIGGER_CLICK = "click";
var TRIGGER_MANUAL = "manual";
var EVENT_HIDE$2 = "hide";
var EVENT_HIDDEN$2 = "hidden";
var EVENT_SHOW$2 = "show";
var EVENT_SHOWN$2 = "shown";
var EVENT_INSERTED = "inserted";
var EVENT_CLICK$1 = "click";
var EVENT_FOCUSIN$1 = "focusin";
var EVENT_FOCUSOUT$1 = "focusout";
var EVENT_MOUSEENTER = "mouseenter";
var EVENT_MOUSELEAVE = "mouseleave";
var AttachmentMap = {
  AUTO: "auto",
  TOP: "top",
  RIGHT: isRTL() ? "left" : "right",
  BOTTOM: "bottom",
  LEFT: isRTL() ? "right" : "left"
};
var Default$3 = {
  allowList: DefaultAllowlist,
  animation: true,
  boundary: "clippingParents",
  container: false,
  customClass: "",
  delay: 0,
  fallbackPlacements: ["top", "right", "bottom", "left"],
  html: false,
  offset: [0, 6],
  placement: "top",
  popperConfig: null,
  sanitize: true,
  sanitizeFn: null,
  selector: false,
  template: '<div class="tooltip" role="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>',
  title: "",
  trigger: "hover focus"
};
var DefaultType$3 = {
  allowList: "object",
  animation: "boolean",
  boundary: "(string|element)",
  container: "(string|element|boolean)",
  customClass: "(string|function)",
  delay: "(number|object)",
  fallbackPlacements: "array",
  html: "boolean",
  offset: "(array|string|function)",
  placement: "(string|function)",
  popperConfig: "(null|object|function)",
  sanitize: "boolean",
  sanitizeFn: "(null|function)",
  selector: "(string|boolean)",
  template: "string",
  title: "(string|element|function)",
  trigger: "string"
};
var Tooltip = class _Tooltip extends BaseComponent {
  constructor(element, config2) {
    if (typeof lib_exports === "undefined") {
      throw new TypeError("Bootstrap's tooltips require Popper (https://popper.js.org/docs/v2/)");
    }
    super(element, config2);
    this._isEnabled = true;
    this._timeout = 0;
    this._isHovered = null;
    this._activeTrigger = {};
    this._popper = null;
    this._templateFactory = null;
    this._newContent = null;
    this.tip = null;
    this._setListeners();
    if (!this._config.selector) {
      this._fixTitle();
    }
  }
  // Getters
  static get Default() {
    return Default$3;
  }
  static get DefaultType() {
    return DefaultType$3;
  }
  static get NAME() {
    return NAME$4;
  }
  // Public
  enable() {
    this._isEnabled = true;
  }
  disable() {
    this._isEnabled = false;
  }
  toggleEnabled() {
    this._isEnabled = !this._isEnabled;
  }
  toggle() {
    if (!this._isEnabled) {
      return;
    }
    if (this._isShown()) {
      this._leave();
      return;
    }
    this._enter();
  }
  dispose() {
    clearTimeout(this._timeout);
    EventHandler.off(this._element.closest(SELECTOR_MODAL), EVENT_MODAL_HIDE, this._hideModalHandler);
    if (this._element.getAttribute("data-bs-original-title")) {
      this._element.setAttribute("title", this._element.getAttribute("data-bs-original-title"));
    }
    this._disposePopper();
    super.dispose();
  }
  show() {
    if (this._element.style.display === "none") {
      throw new Error("Please use show on visible elements");
    }
    if (!(this._isWithContent() && this._isEnabled)) {
      return;
    }
    const showEvent = EventHandler.trigger(this._element, this.constructor.eventName(EVENT_SHOW$2));
    const shadowRoot = findShadowRoot(this._element);
    const isInTheDom = (shadowRoot || this._element.ownerDocument.documentElement).contains(this._element);
    if (showEvent.defaultPrevented || !isInTheDom) {
      return;
    }
    this._disposePopper();
    const tip = this._getTipElement();
    this._element.setAttribute("aria-describedby", tip.getAttribute("id"));
    const {
      container
    } = this._config;
    if (!this._element.ownerDocument.documentElement.contains(this.tip)) {
      container.append(tip);
      EventHandler.trigger(this._element, this.constructor.eventName(EVENT_INSERTED));
    }
    this._popper = this._createPopper(tip);
    tip.classList.add(CLASS_NAME_SHOW$2);
    if ("ontouchstart" in document.documentElement) {
      for (const element of [].concat(...document.body.children)) {
        EventHandler.on(element, "mouseover", noop);
      }
    }
    const complete = () => {
      EventHandler.trigger(this._element, this.constructor.eventName(EVENT_SHOWN$2));
      if (this._isHovered === false) {
        this._leave();
      }
      this._isHovered = false;
    };
    this._queueCallback(complete, this.tip, this._isAnimated());
  }
  hide() {
    if (!this._isShown()) {
      return;
    }
    const hideEvent = EventHandler.trigger(this._element, this.constructor.eventName(EVENT_HIDE$2));
    if (hideEvent.defaultPrevented) {
      return;
    }
    const tip = this._getTipElement();
    tip.classList.remove(CLASS_NAME_SHOW$2);
    if ("ontouchstart" in document.documentElement) {
      for (const element of [].concat(...document.body.children)) {
        EventHandler.off(element, "mouseover", noop);
      }
    }
    this._activeTrigger[TRIGGER_CLICK] = false;
    this._activeTrigger[TRIGGER_FOCUS] = false;
    this._activeTrigger[TRIGGER_HOVER] = false;
    this._isHovered = null;
    const complete = () => {
      if (this._isWithActiveTrigger()) {
        return;
      }
      if (!this._isHovered) {
        this._disposePopper();
      }
      this._element.removeAttribute("aria-describedby");
      EventHandler.trigger(this._element, this.constructor.eventName(EVENT_HIDDEN$2));
    };
    this._queueCallback(complete, this.tip, this._isAnimated());
  }
  update() {
    if (this._popper) {
      this._popper.update();
    }
  }
  // Protected
  _isWithContent() {
    return Boolean(this._getTitle());
  }
  _getTipElement() {
    if (!this.tip) {
      this.tip = this._createTipElement(this._newContent || this._getContentForTemplate());
    }
    return this.tip;
  }
  _createTipElement(content) {
    const tip = this._getTemplateFactory(content).toHtml();
    if (!tip) {
      return null;
    }
    tip.classList.remove(CLASS_NAME_FADE$2, CLASS_NAME_SHOW$2);
    tip.classList.add(`bs-${this.constructor.NAME}-auto`);
    const tipId = getUID(this.constructor.NAME).toString();
    tip.setAttribute("id", tipId);
    if (this._isAnimated()) {
      tip.classList.add(CLASS_NAME_FADE$2);
    }
    return tip;
  }
  setContent(content) {
    this._newContent = content;
    if (this._isShown()) {
      this._disposePopper();
      this.show();
    }
  }
  _getTemplateFactory(content) {
    if (this._templateFactory) {
      this._templateFactory.changeContent(content);
    } else {
      this._templateFactory = new TemplateFactory({
        ...this._config,
        // the `content` var has to be after `this._config`
        // to override config.content in case of popover
        content,
        extraClass: this._resolvePossibleFunction(this._config.customClass)
      });
    }
    return this._templateFactory;
  }
  _getContentForTemplate() {
    return {
      [SELECTOR_TOOLTIP_INNER]: this._getTitle()
    };
  }
  _getTitle() {
    return this._resolvePossibleFunction(this._config.title) || this._element.getAttribute("data-bs-original-title");
  }
  // Private
  _initializeOnDelegatedTarget(event) {
    return this.constructor.getOrCreateInstance(event.delegateTarget, this._getDelegateConfig());
  }
  _isAnimated() {
    return this._config.animation || this.tip && this.tip.classList.contains(CLASS_NAME_FADE$2);
  }
  _isShown() {
    return this.tip && this.tip.classList.contains(CLASS_NAME_SHOW$2);
  }
  _createPopper(tip) {
    const placement = execute(this._config.placement, [this, tip, this._element]);
    const attachment = AttachmentMap[placement.toUpperCase()];
    return createPopper3(this._element, tip, this._getPopperConfig(attachment));
  }
  _getOffset() {
    const {
      offset: offset2
    } = this._config;
    if (typeof offset2 === "string") {
      return offset2.split(",").map((value) => Number.parseInt(value, 10));
    }
    if (typeof offset2 === "function") {
      return (popperData) => offset2(popperData, this._element);
    }
    return offset2;
  }
  _resolvePossibleFunction(arg) {
    return execute(arg, [this._element, this._element]);
  }
  _getPopperConfig(attachment) {
    const defaultBsPopperConfig = {
      placement: attachment,
      modifiers: [{
        name: "flip",
        options: {
          fallbackPlacements: this._config.fallbackPlacements
        }
      }, {
        name: "offset",
        options: {
          offset: this._getOffset()
        }
      }, {
        name: "preventOverflow",
        options: {
          boundary: this._config.boundary
        }
      }, {
        name: "arrow",
        options: {
          element: `.${this.constructor.NAME}-arrow`
        }
      }, {
        name: "preSetPlacement",
        enabled: true,
        phase: "beforeMain",
        fn: (data) => {
          this._getTipElement().setAttribute("data-popper-placement", data.state.placement);
        }
      }]
    };
    return {
      ...defaultBsPopperConfig,
      ...execute(this._config.popperConfig, [void 0, defaultBsPopperConfig])
    };
  }
  _setListeners() {
    const triggers = this._config.trigger.split(" ");
    for (const trigger of triggers) {
      if (trigger === "click") {
        EventHandler.on(this._element, this.constructor.eventName(EVENT_CLICK$1), this._config.selector, (event) => {
          const context = this._initializeOnDelegatedTarget(event);
          context.toggle();
        });
      } else if (trigger !== TRIGGER_MANUAL) {
        const eventIn = trigger === TRIGGER_HOVER ? this.constructor.eventName(EVENT_MOUSEENTER) : this.constructor.eventName(EVENT_FOCUSIN$1);
        const eventOut = trigger === TRIGGER_HOVER ? this.constructor.eventName(EVENT_MOUSELEAVE) : this.constructor.eventName(EVENT_FOCUSOUT$1);
        EventHandler.on(this._element, eventIn, this._config.selector, (event) => {
          const context = this._initializeOnDelegatedTarget(event);
          context._activeTrigger[event.type === "focusin" ? TRIGGER_FOCUS : TRIGGER_HOVER] = true;
          context._enter();
        });
        EventHandler.on(this._element, eventOut, this._config.selector, (event) => {
          const context = this._initializeOnDelegatedTarget(event);
          context._activeTrigger[event.type === "focusout" ? TRIGGER_FOCUS : TRIGGER_HOVER] = context._element.contains(event.relatedTarget);
          context._leave();
        });
      }
    }
    this._hideModalHandler = () => {
      if (this._element) {
        this.hide();
      }
    };
    EventHandler.on(this._element.closest(SELECTOR_MODAL), EVENT_MODAL_HIDE, this._hideModalHandler);
  }
  _fixTitle() {
    const title = this._element.getAttribute("title");
    if (!title) {
      return;
    }
    if (!this._element.getAttribute("aria-label") && !this._element.textContent.trim()) {
      this._element.setAttribute("aria-label", title);
    }
    this._element.setAttribute("data-bs-original-title", title);
    this._element.removeAttribute("title");
  }
  _enter() {
    if (this._isShown() || this._isHovered) {
      this._isHovered = true;
      return;
    }
    this._isHovered = true;
    this._setTimeout(() => {
      if (this._isHovered) {
        this.show();
      }
    }, this._config.delay.show);
  }
  _leave() {
    if (this._isWithActiveTrigger()) {
      return;
    }
    this._isHovered = false;
    this._setTimeout(() => {
      if (!this._isHovered) {
        this.hide();
      }
    }, this._config.delay.hide);
  }
  _setTimeout(handler, timeout) {
    clearTimeout(this._timeout);
    this._timeout = setTimeout(handler, timeout);
  }
  _isWithActiveTrigger() {
    return Object.values(this._activeTrigger).includes(true);
  }
  _getConfig(config2) {
    const dataAttributes = Manipulator.getDataAttributes(this._element);
    for (const dataAttribute of Object.keys(dataAttributes)) {
      if (DISALLOWED_ATTRIBUTES.has(dataAttribute)) {
        delete dataAttributes[dataAttribute];
      }
    }
    config2 = {
      ...dataAttributes,
      ...typeof config2 === "object" && config2 ? config2 : {}
    };
    config2 = this._mergeConfigObj(config2);
    config2 = this._configAfterMerge(config2);
    this._typeCheckConfig(config2);
    return config2;
  }
  _configAfterMerge(config2) {
    config2.container = config2.container === false ? document.body : getElement(config2.container);
    if (typeof config2.delay === "number") {
      config2.delay = {
        show: config2.delay,
        hide: config2.delay
      };
    }
    if (typeof config2.title === "number") {
      config2.title = config2.title.toString();
    }
    if (typeof config2.content === "number") {
      config2.content = config2.content.toString();
    }
    return config2;
  }
  _getDelegateConfig() {
    const config2 = {};
    for (const [key, value] of Object.entries(this._config)) {
      if (this.constructor.Default[key] !== value) {
        config2[key] = value;
      }
    }
    config2.selector = false;
    config2.trigger = "manual";
    return config2;
  }
  _disposePopper() {
    if (this._popper) {
      this._popper.destroy();
      this._popper = null;
    }
    if (this.tip) {
      this.tip.remove();
      this.tip = null;
    }
  }
  // Static
  static jQueryInterface(config2) {
    return this.each(function() {
      const data = _Tooltip.getOrCreateInstance(this, config2);
      if (typeof config2 !== "string") {
        return;
      }
      if (typeof data[config2] === "undefined") {
        throw new TypeError(`No method named "${config2}"`);
      }
      data[config2]();
    });
  }
};
defineJQueryPlugin(Tooltip);
var NAME$3 = "popover";
var SELECTOR_TITLE = ".popover-header";
var SELECTOR_CONTENT = ".popover-body";
var Default$2 = {
  ...Tooltip.Default,
  content: "",
  offset: [0, 8],
  placement: "right",
  template: '<div class="popover" role="tooltip"><div class="popover-arrow"></div><h3 class="popover-header"></h3><div class="popover-body"></div></div>',
  trigger: "click"
};
var DefaultType$2 = {
  ...Tooltip.DefaultType,
  content: "(null|string|element|function)"
};
var Popover = class _Popover extends Tooltip {
  // Getters
  static get Default() {
    return Default$2;
  }
  static get DefaultType() {
    return DefaultType$2;
  }
  static get NAME() {
    return NAME$3;
  }
  // Overrides
  _isWithContent() {
    return this._getTitle() || this._getContent();
  }
  // Private
  _getContentForTemplate() {
    return {
      [SELECTOR_TITLE]: this._getTitle(),
      [SELECTOR_CONTENT]: this._getContent()
    };
  }
  _getContent() {
    return this._resolvePossibleFunction(this._config.content);
  }
  // Static
  static jQueryInterface(config2) {
    return this.each(function() {
      const data = _Popover.getOrCreateInstance(this, config2);
      if (typeof config2 !== "string") {
        return;
      }
      if (typeof data[config2] === "undefined") {
        throw new TypeError(`No method named "${config2}"`);
      }
      data[config2]();
    });
  }
};
defineJQueryPlugin(Popover);
var NAME$2 = "scrollspy";
var DATA_KEY$2 = "bs.scrollspy";
var EVENT_KEY$2 = `.${DATA_KEY$2}`;
var DATA_API_KEY = ".data-api";
var EVENT_ACTIVATE = `activate${EVENT_KEY$2}`;
var EVENT_CLICK = `click${EVENT_KEY$2}`;
var EVENT_LOAD_DATA_API$1 = `load${EVENT_KEY$2}${DATA_API_KEY}`;
var CLASS_NAME_DROPDOWN_ITEM = "dropdown-item";
var CLASS_NAME_ACTIVE$1 = "active";
var SELECTOR_DATA_SPY = '[data-bs-spy="scroll"]';
var SELECTOR_TARGET_LINKS = "[href]";
var SELECTOR_NAV_LIST_GROUP = ".nav, .list-group";
var SELECTOR_NAV_LINKS = ".nav-link";
var SELECTOR_NAV_ITEMS = ".nav-item";
var SELECTOR_LIST_ITEMS = ".list-group-item";
var SELECTOR_LINK_ITEMS = `${SELECTOR_NAV_LINKS}, ${SELECTOR_NAV_ITEMS} > ${SELECTOR_NAV_LINKS}, ${SELECTOR_LIST_ITEMS}`;
var SELECTOR_DROPDOWN = ".dropdown";
var SELECTOR_DROPDOWN_TOGGLE$1 = ".dropdown-toggle";
var Default$1 = {
  offset: null,
  // TODO: v6 @deprecated, keep it for backwards compatibility reasons
  rootMargin: "0px 0px -25%",
  smoothScroll: false,
  target: null,
  threshold: [0.1, 0.5, 1]
};
var DefaultType$1 = {
  offset: "(number|null)",
  // TODO v6 @deprecated, keep it for backwards compatibility reasons
  rootMargin: "string",
  smoothScroll: "boolean",
  target: "element",
  threshold: "array"
};
var ScrollSpy = class _ScrollSpy extends BaseComponent {
  constructor(element, config2) {
    super(element, config2);
    this._targetLinks = /* @__PURE__ */ new Map();
    this._observableSections = /* @__PURE__ */ new Map();
    this._rootElement = getComputedStyle(this._element).overflowY === "visible" ? null : this._element;
    this._activeTarget = null;
    this._observer = null;
    this._previousScrollData = {
      visibleEntryTop: 0,
      parentScrollTop: 0
    };
    this.refresh();
  }
  // Getters
  static get Default() {
    return Default$1;
  }
  static get DefaultType() {
    return DefaultType$1;
  }
  static get NAME() {
    return NAME$2;
  }
  // Public
  refresh() {
    this._initializeTargetsAndObservables();
    this._maybeEnableSmoothScroll();
    if (this._observer) {
      this._observer.disconnect();
    } else {
      this._observer = this._getNewObserver();
    }
    for (const section of this._observableSections.values()) {
      this._observer.observe(section);
    }
  }
  dispose() {
    this._observer.disconnect();
    super.dispose();
  }
  // Private
  _configAfterMerge(config2) {
    config2.target = getElement(config2.target) || document.body;
    config2.rootMargin = config2.offset ? `${config2.offset}px 0px -30%` : config2.rootMargin;
    if (typeof config2.threshold === "string") {
      config2.threshold = config2.threshold.split(",").map((value) => Number.parseFloat(value));
    }
    return config2;
  }
  _maybeEnableSmoothScroll() {
    if (!this._config.smoothScroll) {
      return;
    }
    EventHandler.off(this._config.target, EVENT_CLICK);
    EventHandler.on(this._config.target, EVENT_CLICK, SELECTOR_TARGET_LINKS, (event) => {
      const observableSection = this._observableSections.get(event.target.hash);
      if (observableSection) {
        event.preventDefault();
        const root = this._rootElement || window;
        const height = observableSection.offsetTop - this._element.offsetTop;
        if (root.scrollTo) {
          root.scrollTo({
            top: height,
            behavior: "smooth"
          });
          return;
        }
        root.scrollTop = height;
      }
    });
  }
  _getNewObserver() {
    const options = {
      root: this._rootElement,
      threshold: this._config.threshold,
      rootMargin: this._config.rootMargin
    };
    return new IntersectionObserver((entries) => this._observerCallback(entries), options);
  }
  // The logic of selection
  _observerCallback(entries) {
    const targetElement = (entry) => this._targetLinks.get(`#${entry.target.id}`);
    const activate = (entry) => {
      this._previousScrollData.visibleEntryTop = entry.target.offsetTop;
      this._process(targetElement(entry));
    };
    const parentScrollTop = (this._rootElement || document.documentElement).scrollTop;
    const userScrollsDown = parentScrollTop >= this._previousScrollData.parentScrollTop;
    this._previousScrollData.parentScrollTop = parentScrollTop;
    for (const entry of entries) {
      if (!entry.isIntersecting) {
        this._activeTarget = null;
        this._clearActiveClass(targetElement(entry));
        continue;
      }
      const entryIsLowerThanPrevious = entry.target.offsetTop >= this._previousScrollData.visibleEntryTop;
      if (userScrollsDown && entryIsLowerThanPrevious) {
        activate(entry);
        if (!parentScrollTop) {
          return;
        }
        continue;
      }
      if (!userScrollsDown && !entryIsLowerThanPrevious) {
        activate(entry);
      }
    }
  }
  _initializeTargetsAndObservables() {
    this._targetLinks = /* @__PURE__ */ new Map();
    this._observableSections = /* @__PURE__ */ new Map();
    const targetLinks = SelectorEngine.find(SELECTOR_TARGET_LINKS, this._config.target);
    for (const anchor of targetLinks) {
      if (!anchor.hash || isDisabled(anchor)) {
        continue;
      }
      const observableSection = SelectorEngine.findOne(decodeURI(anchor.hash), this._element);
      if (isVisible(observableSection)) {
        this._targetLinks.set(decodeURI(anchor.hash), anchor);
        this._observableSections.set(anchor.hash, observableSection);
      }
    }
  }
  _process(target) {
    if (this._activeTarget === target) {
      return;
    }
    this._clearActiveClass(this._config.target);
    this._activeTarget = target;
    target.classList.add(CLASS_NAME_ACTIVE$1);
    this._activateParents(target);
    EventHandler.trigger(this._element, EVENT_ACTIVATE, {
      relatedTarget: target
    });
  }
  _activateParents(target) {
    if (target.classList.contains(CLASS_NAME_DROPDOWN_ITEM)) {
      SelectorEngine.findOne(SELECTOR_DROPDOWN_TOGGLE$1, target.closest(SELECTOR_DROPDOWN)).classList.add(CLASS_NAME_ACTIVE$1);
      return;
    }
    for (const listGroup of SelectorEngine.parents(target, SELECTOR_NAV_LIST_GROUP)) {
      for (const item of SelectorEngine.prev(listGroup, SELECTOR_LINK_ITEMS)) {
        item.classList.add(CLASS_NAME_ACTIVE$1);
      }
    }
  }
  _clearActiveClass(parent) {
    parent.classList.remove(CLASS_NAME_ACTIVE$1);
    const activeNodes = SelectorEngine.find(`${SELECTOR_TARGET_LINKS}.${CLASS_NAME_ACTIVE$1}`, parent);
    for (const node of activeNodes) {
      node.classList.remove(CLASS_NAME_ACTIVE$1);
    }
  }
  // Static
  static jQueryInterface(config2) {
    return this.each(function() {
      const data = _ScrollSpy.getOrCreateInstance(this, config2);
      if (typeof config2 !== "string") {
        return;
      }
      if (data[config2] === void 0 || config2.startsWith("_") || config2 === "constructor") {
        throw new TypeError(`No method named "${config2}"`);
      }
      data[config2]();
    });
  }
};
EventHandler.on(window, EVENT_LOAD_DATA_API$1, () => {
  for (const spy of SelectorEngine.find(SELECTOR_DATA_SPY)) {
    ScrollSpy.getOrCreateInstance(spy);
  }
});
defineJQueryPlugin(ScrollSpy);
var NAME$1 = "tab";
var DATA_KEY$1 = "bs.tab";
var EVENT_KEY$1 = `.${DATA_KEY$1}`;
var EVENT_HIDE$1 = `hide${EVENT_KEY$1}`;
var EVENT_HIDDEN$1 = `hidden${EVENT_KEY$1}`;
var EVENT_SHOW$1 = `show${EVENT_KEY$1}`;
var EVENT_SHOWN$1 = `shown${EVENT_KEY$1}`;
var EVENT_CLICK_DATA_API = `click${EVENT_KEY$1}`;
var EVENT_KEYDOWN = `keydown${EVENT_KEY$1}`;
var EVENT_LOAD_DATA_API = `load${EVENT_KEY$1}`;
var ARROW_LEFT_KEY = "ArrowLeft";
var ARROW_RIGHT_KEY = "ArrowRight";
var ARROW_UP_KEY = "ArrowUp";
var ARROW_DOWN_KEY = "ArrowDown";
var HOME_KEY = "Home";
var END_KEY = "End";
var CLASS_NAME_ACTIVE = "active";
var CLASS_NAME_FADE$1 = "fade";
var CLASS_NAME_SHOW$1 = "show";
var CLASS_DROPDOWN = "dropdown";
var SELECTOR_DROPDOWN_TOGGLE = ".dropdown-toggle";
var SELECTOR_DROPDOWN_MENU = ".dropdown-menu";
var NOT_SELECTOR_DROPDOWN_TOGGLE = `:not(${SELECTOR_DROPDOWN_TOGGLE})`;
var SELECTOR_TAB_PANEL = '.list-group, .nav, [role="tablist"]';
var SELECTOR_OUTER = ".nav-item, .list-group-item";
var SELECTOR_INNER = `.nav-link${NOT_SELECTOR_DROPDOWN_TOGGLE}, .list-group-item${NOT_SELECTOR_DROPDOWN_TOGGLE}, [role="tab"]${NOT_SELECTOR_DROPDOWN_TOGGLE}`;
var SELECTOR_DATA_TOGGLE = '[data-bs-toggle="tab"], [data-bs-toggle="pill"], [data-bs-toggle="list"]';
var SELECTOR_INNER_ELEM = `${SELECTOR_INNER}, ${SELECTOR_DATA_TOGGLE}`;
var SELECTOR_DATA_TOGGLE_ACTIVE = `.${CLASS_NAME_ACTIVE}[data-bs-toggle="tab"], .${CLASS_NAME_ACTIVE}[data-bs-toggle="pill"], .${CLASS_NAME_ACTIVE}[data-bs-toggle="list"]`;
var Tab = class _Tab extends BaseComponent {
  constructor(element) {
    super(element);
    this._parent = this._element.closest(SELECTOR_TAB_PANEL);
    if (!this._parent) {
      return;
    }
    this._setInitialAttributes(this._parent, this._getChildren());
    EventHandler.on(this._element, EVENT_KEYDOWN, (event) => this._keydown(event));
  }
  // Getters
  static get NAME() {
    return NAME$1;
  }
  // Public
  show() {
    const innerElem = this._element;
    if (this._elemIsActive(innerElem)) {
      return;
    }
    const active = this._getActiveElem();
    const hideEvent = active ? EventHandler.trigger(active, EVENT_HIDE$1, {
      relatedTarget: innerElem
    }) : null;
    const showEvent = EventHandler.trigger(innerElem, EVENT_SHOW$1, {
      relatedTarget: active
    });
    if (showEvent.defaultPrevented || hideEvent && hideEvent.defaultPrevented) {
      return;
    }
    this._deactivate(active, innerElem);
    this._activate(innerElem, active);
  }
  // Private
  _activate(element, relatedElem) {
    if (!element) {
      return;
    }
    element.classList.add(CLASS_NAME_ACTIVE);
    this._activate(SelectorEngine.getElementFromSelector(element));
    const complete = () => {
      if (element.getAttribute("role") !== "tab") {
        element.classList.add(CLASS_NAME_SHOW$1);
        return;
      }
      element.removeAttribute("tabindex");
      element.setAttribute("aria-selected", true);
      this._toggleDropDown(element, true);
      EventHandler.trigger(element, EVENT_SHOWN$1, {
        relatedTarget: relatedElem
      });
    };
    this._queueCallback(complete, element, element.classList.contains(CLASS_NAME_FADE$1));
  }
  _deactivate(element, relatedElem) {
    if (!element) {
      return;
    }
    element.classList.remove(CLASS_NAME_ACTIVE);
    element.blur();
    this._deactivate(SelectorEngine.getElementFromSelector(element));
    const complete = () => {
      if (element.getAttribute("role") !== "tab") {
        element.classList.remove(CLASS_NAME_SHOW$1);
        return;
      }
      element.setAttribute("aria-selected", false);
      element.setAttribute("tabindex", "-1");
      this._toggleDropDown(element, false);
      EventHandler.trigger(element, EVENT_HIDDEN$1, {
        relatedTarget: relatedElem
      });
    };
    this._queueCallback(complete, element, element.classList.contains(CLASS_NAME_FADE$1));
  }
  _keydown(event) {
    if (![ARROW_LEFT_KEY, ARROW_RIGHT_KEY, ARROW_UP_KEY, ARROW_DOWN_KEY, HOME_KEY, END_KEY].includes(event.key)) {
      return;
    }
    event.stopPropagation();
    event.preventDefault();
    const children = this._getChildren().filter((element) => !isDisabled(element));
    let nextActiveElement;
    if ([HOME_KEY, END_KEY].includes(event.key)) {
      nextActiveElement = children[event.key === HOME_KEY ? 0 : children.length - 1];
    } else {
      const isNext = [ARROW_RIGHT_KEY, ARROW_DOWN_KEY].includes(event.key);
      nextActiveElement = getNextActiveElement(children, event.target, isNext, true);
    }
    if (nextActiveElement) {
      nextActiveElement.focus({
        preventScroll: true
      });
      _Tab.getOrCreateInstance(nextActiveElement).show();
    }
  }
  _getChildren() {
    return SelectorEngine.find(SELECTOR_INNER_ELEM, this._parent);
  }
  _getActiveElem() {
    return this._getChildren().find((child) => this._elemIsActive(child)) || null;
  }
  _setInitialAttributes(parent, children) {
    this._setAttributeIfNotExists(parent, "role", "tablist");
    for (const child of children) {
      this._setInitialAttributesOnChild(child);
    }
  }
  _setInitialAttributesOnChild(child) {
    child = this._getInnerElement(child);
    const isActive = this._elemIsActive(child);
    const outerElem = this._getOuterElement(child);
    child.setAttribute("aria-selected", isActive);
    if (outerElem !== child) {
      this._setAttributeIfNotExists(outerElem, "role", "presentation");
    }
    if (!isActive) {
      child.setAttribute("tabindex", "-1");
    }
    this._setAttributeIfNotExists(child, "role", "tab");
    this._setInitialAttributesOnTargetPanel(child);
  }
  _setInitialAttributesOnTargetPanel(child) {
    const target = SelectorEngine.getElementFromSelector(child);
    if (!target) {
      return;
    }
    this._setAttributeIfNotExists(target, "role", "tabpanel");
    if (child.id) {
      this._setAttributeIfNotExists(target, "aria-labelledby", `${child.id}`);
    }
  }
  _toggleDropDown(element, open) {
    const outerElem = this._getOuterElement(element);
    if (!outerElem.classList.contains(CLASS_DROPDOWN)) {
      return;
    }
    const toggle = (selector, className) => {
      const element2 = SelectorEngine.findOne(selector, outerElem);
      if (element2) {
        element2.classList.toggle(className, open);
      }
    };
    toggle(SELECTOR_DROPDOWN_TOGGLE, CLASS_NAME_ACTIVE);
    toggle(SELECTOR_DROPDOWN_MENU, CLASS_NAME_SHOW$1);
    outerElem.setAttribute("aria-expanded", open);
  }
  _setAttributeIfNotExists(element, attribute, value) {
    if (!element.hasAttribute(attribute)) {
      element.setAttribute(attribute, value);
    }
  }
  _elemIsActive(elem) {
    return elem.classList.contains(CLASS_NAME_ACTIVE);
  }
  // Try to get the inner element (usually the .nav-link)
  _getInnerElement(elem) {
    return elem.matches(SELECTOR_INNER_ELEM) ? elem : SelectorEngine.findOne(SELECTOR_INNER_ELEM, elem);
  }
  // Try to get the outer element (usually the .nav-item)
  _getOuterElement(elem) {
    return elem.closest(SELECTOR_OUTER) || elem;
  }
  // Static
  static jQueryInterface(config2) {
    return this.each(function() {
      const data = _Tab.getOrCreateInstance(this);
      if (typeof config2 !== "string") {
        return;
      }
      if (data[config2] === void 0 || config2.startsWith("_") || config2 === "constructor") {
        throw new TypeError(`No method named "${config2}"`);
      }
      data[config2]();
    });
  }
};
EventHandler.on(document, EVENT_CLICK_DATA_API, SELECTOR_DATA_TOGGLE, function(event) {
  if (["A", "AREA"].includes(this.tagName)) {
    event.preventDefault();
  }
  if (isDisabled(this)) {
    return;
  }
  Tab.getOrCreateInstance(this).show();
});
EventHandler.on(window, EVENT_LOAD_DATA_API, () => {
  for (const element of SelectorEngine.find(SELECTOR_DATA_TOGGLE_ACTIVE)) {
    Tab.getOrCreateInstance(element);
  }
});
defineJQueryPlugin(Tab);
var NAME = "toast";
var DATA_KEY = "bs.toast";
var EVENT_KEY = `.${DATA_KEY}`;
var EVENT_MOUSEOVER = `mouseover${EVENT_KEY}`;
var EVENT_MOUSEOUT = `mouseout${EVENT_KEY}`;
var EVENT_FOCUSIN = `focusin${EVENT_KEY}`;
var EVENT_FOCUSOUT = `focusout${EVENT_KEY}`;
var EVENT_HIDE = `hide${EVENT_KEY}`;
var EVENT_HIDDEN = `hidden${EVENT_KEY}`;
var EVENT_SHOW = `show${EVENT_KEY}`;
var EVENT_SHOWN = `shown${EVENT_KEY}`;
var CLASS_NAME_FADE = "fade";
var CLASS_NAME_HIDE = "hide";
var CLASS_NAME_SHOW = "show";
var CLASS_NAME_SHOWING = "showing";
var DefaultType = {
  animation: "boolean",
  autohide: "boolean",
  delay: "number"
};
var Default = {
  animation: true,
  autohide: true,
  delay: 5e3
};
var Toast = class _Toast extends BaseComponent {
  constructor(element, config2) {
    super(element, config2);
    this._timeout = null;
    this._hasMouseInteraction = false;
    this._hasKeyboardInteraction = false;
    this._setListeners();
  }
  // Getters
  static get Default() {
    return Default;
  }
  static get DefaultType() {
    return DefaultType;
  }
  static get NAME() {
    return NAME;
  }
  // Public
  show() {
    const showEvent = EventHandler.trigger(this._element, EVENT_SHOW);
    if (showEvent.defaultPrevented) {
      return;
    }
    this._clearTimeout();
    if (this._config.animation) {
      this._element.classList.add(CLASS_NAME_FADE);
    }
    const complete = () => {
      this._element.classList.remove(CLASS_NAME_SHOWING);
      EventHandler.trigger(this._element, EVENT_SHOWN);
      this._maybeScheduleHide();
    };
    this._element.classList.remove(CLASS_NAME_HIDE);
    reflow(this._element);
    this._element.classList.add(CLASS_NAME_SHOW, CLASS_NAME_SHOWING);
    this._queueCallback(complete, this._element, this._config.animation);
  }
  hide() {
    if (!this.isShown()) {
      return;
    }
    const hideEvent = EventHandler.trigger(this._element, EVENT_HIDE);
    if (hideEvent.defaultPrevented) {
      return;
    }
    const complete = () => {
      this._element.classList.add(CLASS_NAME_HIDE);
      this._element.classList.remove(CLASS_NAME_SHOWING, CLASS_NAME_SHOW);
      EventHandler.trigger(this._element, EVENT_HIDDEN);
    };
    this._element.classList.add(CLASS_NAME_SHOWING);
    this._queueCallback(complete, this._element, this._config.animation);
  }
  dispose() {
    this._clearTimeout();
    if (this.isShown()) {
      this._element.classList.remove(CLASS_NAME_SHOW);
    }
    super.dispose();
  }
  isShown() {
    return this._element.classList.contains(CLASS_NAME_SHOW);
  }
  // Private
  _maybeScheduleHide() {
    if (!this._config.autohide) {
      return;
    }
    if (this._hasMouseInteraction || this._hasKeyboardInteraction) {
      return;
    }
    this._timeout = setTimeout(() => {
      this.hide();
    }, this._config.delay);
  }
  _onInteraction(event, isInteracting) {
    switch (event.type) {
      case "mouseover":
      case "mouseout": {
        this._hasMouseInteraction = isInteracting;
        break;
      }
      case "focusin":
      case "focusout": {
        this._hasKeyboardInteraction = isInteracting;
        break;
      }
    }
    if (isInteracting) {
      this._clearTimeout();
      return;
    }
    const nextElement = event.relatedTarget;
    if (this._element === nextElement || this._element.contains(nextElement)) {
      return;
    }
    this._maybeScheduleHide();
  }
  _setListeners() {
    EventHandler.on(this._element, EVENT_MOUSEOVER, (event) => this._onInteraction(event, true));
    EventHandler.on(this._element, EVENT_MOUSEOUT, (event) => this._onInteraction(event, false));
    EventHandler.on(this._element, EVENT_FOCUSIN, (event) => this._onInteraction(event, true));
    EventHandler.on(this._element, EVENT_FOCUSOUT, (event) => this._onInteraction(event, false));
  }
  _clearTimeout() {
    clearTimeout(this._timeout);
    this._timeout = null;
  }
  // Static
  static jQueryInterface(config2) {
    return this.each(function() {
      const data = _Toast.getOrCreateInstance(this, config2);
      if (typeof config2 === "string") {
        if (typeof data[config2] === "undefined") {
          throw new TypeError(`No method named "${config2}"`);
        }
        data[config2](this);
      }
    });
  }
};
enableDismissTrigger(Toast);
defineJQueryPlugin(Toast);

// node_modules/trix/dist/trix.esm.min.js
var t = "2.1.13";
var e = "[data-trix-attachment]";
var i = { preview: { presentation: "gallery", caption: { name: true, size: true } }, file: { caption: { size: true } } };
var n = { default: { tagName: "div", parse: false }, quote: { tagName: "blockquote", nestable: true }, heading1: { tagName: "h1", terminal: true, breakOnReturn: true, group: false }, code: { tagName: "pre", terminal: true, htmlAttributes: ["language"], text: { plaintext: true } }, bulletList: { tagName: "ul", parse: false }, bullet: { tagName: "li", listAttribute: "bulletList", group: false, nestable: true, test(t3) {
  return r(t3.parentNode) === n[this.listAttribute].tagName;
} }, numberList: { tagName: "ol", parse: false }, number: { tagName: "li", listAttribute: "numberList", group: false, nestable: true, test(t3) {
  return r(t3.parentNode) === n[this.listAttribute].tagName;
} }, attachmentGallery: { tagName: "div", exclusive: true, terminal: true, parse: false, group: false } };
var r = (t3) => {
  var e2;
  return null == t3 || null === (e2 = t3.tagName) || void 0 === e2 ? void 0 : e2.toLowerCase();
};
var o = navigator.userAgent.match(/android\s([0-9]+.*Chrome)/i);
var s = o && parseInt(o[1]);
var a = { composesExistingText: /Android.*Chrome/.test(navigator.userAgent), recentAndroid: s && s > 12, samsungAndroid: s && navigator.userAgent.match(/Android.*SM-/), forcesObjectResizing: /Trident.*rv:11/.test(navigator.userAgent), supportsInputEvents: "undefined" != typeof InputEvent && ["data", "getTargetRanges", "inputType"].every((t3) => t3 in InputEvent.prototype) };
var l = { ADD_ATTR: ["language"], SAFE_FOR_XML: false, RETURN_DOM: true };
var c = { attachFiles: "Attach Files", bold: "Bold", bullets: "Bullets", byte: "Byte", bytes: "Bytes", captionPlaceholder: "Add a caption\u2026", code: "Code", heading1: "Heading", indent: "Increase Level", italic: "Italic", link: "Link", numbers: "Numbers", outdent: "Decrease Level", quote: "Quote", redo: "Redo", remove: "Remove", strike: "Strikethrough", undo: "Undo", unlink: "Unlink", url: "URL", urlPlaceholder: "Enter a URL\u2026", GB: "GB", KB: "KB", MB: "MB", PB: "PB", TB: "TB" };
var u = [c.bytes, c.KB, c.MB, c.GB, c.TB, c.PB];
var h = { prefix: "IEC", precision: 2, formatter(t3) {
  switch (t3) {
    case 0:
      return "0 ".concat(c.bytes);
    case 1:
      return "1 ".concat(c.byte);
    default:
      let e2;
      "SI" === this.prefix ? e2 = 1e3 : "IEC" === this.prefix && (e2 = 1024);
      const i2 = Math.floor(Math.log(t3) / Math.log(e2)), n2 = (t3 / Math.pow(e2, i2)).toFixed(this.precision).replace(/0*$/, "").replace(/\.$/, "");
      return "".concat(n2, " ").concat(u[i2]);
  }
} };
var d = "\uFEFF";
var g = "\xA0";
var m = function(t3) {
  for (const e2 in t3) {
    const i2 = t3[e2];
    this[e2] = i2;
  }
  return this;
};
var p = document.documentElement;
var f = p.matches;
var b = function(t3) {
  let { onElement: e2, matchingSelector: i2, withCallback: n2, inPhase: r2, preventDefault: o2, times: s2 } = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {};
  const a2 = e2 || p, l2 = i2, c2 = "capturing" === r2, u2 = function(t4) {
    null != s2 && 0 == --s2 && u2.destroy();
    const e3 = y(t4.target, { matchingSelector: l2 });
    null != e3 && (null == n2 || n2.call(e3, t4, e3), o2 && t4.preventDefault());
  };
  return u2.destroy = () => a2.removeEventListener(t3, u2, c2), a2.addEventListener(t3, u2, c2), u2;
};
var v = function(t3) {
  let { onElement: e2, bubbles: i2, cancelable: n2, attributes: r2 } = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {};
  const o2 = null != e2 ? e2 : p;
  i2 = false !== i2, n2 = false !== n2;
  const s2 = document.createEvent("Events");
  return s2.initEvent(t3, i2, n2), null != r2 && m.call(s2, r2), o2.dispatchEvent(s2);
};
var A = function(t3, e2) {
  if (1 === (null == t3 ? void 0 : t3.nodeType)) return f.call(t3, e2);
};
var y = function(t3) {
  let { matchingSelector: e2, untilNode: i2 } = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {};
  for (; t3 && t3.nodeType !== Node.ELEMENT_NODE; ) t3 = t3.parentNode;
  if (null != t3) {
    if (null == e2) return t3;
    if (t3.closest && null == i2) return t3.closest(e2);
    for (; t3 && t3 !== i2; ) {
      if (A(t3, e2)) return t3;
      t3 = t3.parentNode;
    }
  }
};
var x = (t3) => document.activeElement !== t3 && C(t3, document.activeElement);
var C = function(t3, e2) {
  if (t3 && e2) for (; e2; ) {
    if (e2 === t3) return true;
    e2 = e2.parentNode;
  }
};
var E = function(t3) {
  var e2;
  if (null === (e2 = t3) || void 0 === e2 || !e2.parentNode) return;
  let i2 = 0;
  for (t3 = t3.previousSibling; t3; ) i2++, t3 = t3.previousSibling;
  return i2;
};
var S = (t3) => {
  var e2;
  return null == t3 || null === (e2 = t3.parentNode) || void 0 === e2 ? void 0 : e2.removeChild(t3);
};
var R = function(t3) {
  let { onlyNodesOfType: e2, usingFilter: i2, expandEntityReferences: n2 } = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {};
  const r2 = (() => {
    switch (e2) {
      case "element":
        return NodeFilter.SHOW_ELEMENT;
      case "text":
        return NodeFilter.SHOW_TEXT;
      case "comment":
        return NodeFilter.SHOW_COMMENT;
      default:
        return NodeFilter.SHOW_ALL;
    }
  })();
  return document.createTreeWalker(t3, r2, null != i2 ? i2 : null, true === n2);
};
var k = (t3) => {
  var e2;
  return null == t3 || null === (e2 = t3.tagName) || void 0 === e2 ? void 0 : e2.toLowerCase();
};
var T = function(t3) {
  let e2, i2, n2 = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {};
  "object" == typeof t3 ? (n2 = t3, t3 = n2.tagName) : n2 = { attributes: n2 };
  const r2 = document.createElement(t3);
  if (null != n2.editable && (null == n2.attributes && (n2.attributes = {}), n2.attributes.contenteditable = n2.editable), n2.attributes) for (e2 in n2.attributes) i2 = n2.attributes[e2], r2.setAttribute(e2, i2);
  if (n2.style) for (e2 in n2.style) i2 = n2.style[e2], r2.style[e2] = i2;
  if (n2.data) for (e2 in n2.data) i2 = n2.data[e2], r2.dataset[e2] = i2;
  return n2.className && n2.className.split(" ").forEach((t4) => {
    r2.classList.add(t4);
  }), n2.textContent && (r2.textContent = n2.textContent), n2.childNodes && [].concat(n2.childNodes).forEach((t4) => {
    r2.appendChild(t4);
  }), r2;
};
var w;
var L = function() {
  if (null != w) return w;
  w = [];
  for (const t3 in n) {
    const e2 = n[t3];
    e2.tagName && w.push(e2.tagName);
  }
  return w;
};
var D = (t3) => I(null == t3 ? void 0 : t3.firstChild);
var N = function(t3) {
  let { strict: e2 } = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : { strict: true };
  return e2 ? I(t3) : I(t3) || !I(t3.firstChild) && function(t4) {
    return L().includes(k(t4)) && !L().includes(k(t4.firstChild));
  }(t3);
};
var I = (t3) => O(t3) && "block" === (null == t3 ? void 0 : t3.data);
var O = (t3) => (null == t3 ? void 0 : t3.nodeType) === Node.COMMENT_NODE;
var F = function(t3) {
  let { name: e2 } = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {};
  if (t3) return B(t3) ? t3.data === d ? !e2 || t3.parentNode.dataset.trixCursorTarget === e2 : void 0 : F(t3.firstChild);
};
var P = (t3) => A(t3, e);
var M = (t3) => B(t3) && "" === (null == t3 ? void 0 : t3.data);
var B = (t3) => (null == t3 ? void 0 : t3.nodeType) === Node.TEXT_NODE;
var _ = { level2Enabled: true, getLevel() {
  return this.level2Enabled && a.supportsInputEvents ? 2 : 0;
}, pickFiles(t3) {
  const e2 = T("input", { type: "file", multiple: true, hidden: true, id: this.fileInputId });
  e2.addEventListener("change", () => {
    t3(e2.files), S(e2);
  }), S(document.getElementById(this.fileInputId)), document.body.appendChild(e2), e2.click();
} };
var j = { removeBlankTableCells: false, tableCellSeparator: " | ", tableRowSeparator: "\n" };
var W = { bold: { tagName: "strong", inheritable: true, parser(t3) {
  const e2 = window.getComputedStyle(t3);
  return "bold" === e2.fontWeight || e2.fontWeight >= 600;
} }, italic: { tagName: "em", inheritable: true, parser: (t3) => "italic" === window.getComputedStyle(t3).fontStyle }, href: { groupTagName: "a", parser(t3) {
  const i2 = "a:not(".concat(e, ")"), n2 = t3.closest(i2);
  if (n2) return n2.getAttribute("href");
} }, strike: { tagName: "del", inheritable: true }, frozen: { style: { backgroundColor: "highlight" } } };
var U = { getDefaultHTML: () => '<div class="trix-button-row">\n      <span class="trix-button-group trix-button-group--text-tools" data-trix-button-group="text-tools">\n        <button type="button" class="trix-button trix-button--icon trix-button--icon-bold" data-trix-attribute="bold" data-trix-key="b" title="'.concat(c.bold, '" tabindex="-1">').concat(c.bold, '</button>\n        <button type="button" class="trix-button trix-button--icon trix-button--icon-italic" data-trix-attribute="italic" data-trix-key="i" title="').concat(c.italic, '" tabindex="-1">').concat(c.italic, '</button>\n        <button type="button" class="trix-button trix-button--icon trix-button--icon-strike" data-trix-attribute="strike" title="').concat(c.strike, '" tabindex="-1">').concat(c.strike, '</button>\n        <button type="button" class="trix-button trix-button--icon trix-button--icon-link" data-trix-attribute="href" data-trix-action="link" data-trix-key="k" title="').concat(c.link, '" tabindex="-1">').concat(c.link, '</button>\n      </span>\n\n      <span class="trix-button-group trix-button-group--block-tools" data-trix-button-group="block-tools">\n        <button type="button" class="trix-button trix-button--icon trix-button--icon-heading-1" data-trix-attribute="heading1" title="').concat(c.heading1, '" tabindex="-1">').concat(c.heading1, '</button>\n        <button type="button" class="trix-button trix-button--icon trix-button--icon-quote" data-trix-attribute="quote" title="').concat(c.quote, '" tabindex="-1">').concat(c.quote, '</button>\n        <button type="button" class="trix-button trix-button--icon trix-button--icon-code" data-trix-attribute="code" title="').concat(c.code, '" tabindex="-1">').concat(c.code, '</button>\n        <button type="button" class="trix-button trix-button--icon trix-button--icon-bullet-list" data-trix-attribute="bullet" title="').concat(c.bullets, '" tabindex="-1">').concat(c.bullets, '</button>\n        <button type="button" class="trix-button trix-button--icon trix-button--icon-number-list" data-trix-attribute="number" title="').concat(c.numbers, '" tabindex="-1">').concat(c.numbers, '</button>\n        <button type="button" class="trix-button trix-button--icon trix-button--icon-decrease-nesting-level" data-trix-action="decreaseNestingLevel" title="').concat(c.outdent, '" tabindex="-1">').concat(c.outdent, '</button>\n        <button type="button" class="trix-button trix-button--icon trix-button--icon-increase-nesting-level" data-trix-action="increaseNestingLevel" title="').concat(c.indent, '" tabindex="-1">').concat(c.indent, '</button>\n      </span>\n\n      <span class="trix-button-group trix-button-group--file-tools" data-trix-button-group="file-tools">\n        <button type="button" class="trix-button trix-button--icon trix-button--icon-attach" data-trix-action="attachFiles" title="').concat(c.attachFiles, '" tabindex="-1">').concat(c.attachFiles, '</button>\n      </span>\n\n      <span class="trix-button-group-spacer"></span>\n\n      <span class="trix-button-group trix-button-group--history-tools" data-trix-button-group="history-tools">\n        <button type="button" class="trix-button trix-button--icon trix-button--icon-undo" data-trix-action="undo" data-trix-key="z" title="').concat(c.undo, '" tabindex="-1">').concat(c.undo, '</button>\n        <button type="button" class="trix-button trix-button--icon trix-button--icon-redo" data-trix-action="redo" data-trix-key="shift+z" title="').concat(c.redo, '" tabindex="-1">').concat(c.redo, '</button>\n      </span>\n    </div>\n\n    <div class="trix-dialogs" data-trix-dialogs>\n      <div class="trix-dialog trix-dialog--link" data-trix-dialog="href" data-trix-dialog-attribute="href">\n        <div class="trix-dialog__link-fields">\n          <input type="url" name="href" class="trix-input trix-input--dialog" placeholder="').concat(c.urlPlaceholder, '" aria-label="').concat(c.url, '" data-trix-validate-href required data-trix-input>\n          <div class="trix-button-group">\n            <input type="button" class="trix-button trix-button--dialog" value="').concat(c.link, '" data-trix-method="setAttribute">\n            <input type="button" class="trix-button trix-button--dialog" value="').concat(c.unlink, '" data-trix-method="removeAttribute">\n          </div>\n        </div>\n      </div>\n    </div>') };
var V = { interval: 5e3 };
var z = Object.freeze({ __proto__: null, attachments: i, blockAttributes: n, browser: a, css: { attachment: "attachment", attachmentCaption: "attachment__caption", attachmentCaptionEditor: "attachment__caption-editor", attachmentMetadata: "attachment__metadata", attachmentMetadataContainer: "attachment__metadata-container", attachmentName: "attachment__name", attachmentProgress: "attachment__progress", attachmentSize: "attachment__size", attachmentToolbar: "attachment__toolbar", attachmentGallery: "attachment-gallery" }, dompurify: l, fileSize: h, input: _, keyNames: { 8: "backspace", 9: "tab", 13: "return", 27: "escape", 37: "left", 39: "right", 46: "delete", 68: "d", 72: "h", 79: "o" }, lang: c, parser: j, textAttributes: W, toolbar: U, undo: V });
var q = class {
  static proxyMethod(t3) {
    const { name: e2, toMethod: i2, toProperty: n2, optional: r2 } = H(t3);
    this.prototype[e2] = function() {
      let t4, o2;
      var s2, a2;
      i2 ? o2 = r2 ? null === (s2 = this[i2]) || void 0 === s2 ? void 0 : s2.call(this) : this[i2]() : n2 && (o2 = this[n2]);
      return r2 ? (t4 = null === (a2 = o2) || void 0 === a2 ? void 0 : a2[e2], t4 ? J.call(t4, o2, arguments) : void 0) : (t4 = o2[e2], J.call(t4, o2, arguments));
    };
  }
};
var H = function(t3) {
  const e2 = t3.match(K);
  if (!e2) throw new Error("can't parse @proxyMethod expression: ".concat(t3));
  const i2 = { name: e2[4] };
  return null != e2[2] ? i2.toMethod = e2[1] : i2.toProperty = e2[1], null != e2[3] && (i2.optional = true), i2;
};
var { apply: J } = Function.prototype;
var K = new RegExp("^(.+?)(\\(\\))?(\\?)?\\.(.+?)$");
var G;
var Y;
var $;
var X = class extends q {
  static box() {
    let t3 = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : "";
    return t3 instanceof this ? t3 : this.fromUCS2String(null == t3 ? void 0 : t3.toString());
  }
  static fromUCS2String(t3) {
    return new this(t3, et(t3));
  }
  static fromCodepoints(t3) {
    return new this(it(t3), t3);
  }
  constructor(t3, e2) {
    super(...arguments), this.ucs2String = t3, this.codepoints = e2, this.length = this.codepoints.length, this.ucs2Length = this.ucs2String.length;
  }
  offsetToUCS2Offset(t3) {
    return it(this.codepoints.slice(0, Math.max(0, t3))).length;
  }
  offsetFromUCS2Offset(t3) {
    return et(this.ucs2String.slice(0, Math.max(0, t3))).length;
  }
  slice() {
    return this.constructor.fromCodepoints(this.codepoints.slice(...arguments));
  }
  charAt(t3) {
    return this.slice(t3, t3 + 1);
  }
  isEqualTo(t3) {
    return this.constructor.box(t3).ucs2String === this.ucs2String;
  }
  toJSON() {
    return this.ucs2String;
  }
  getCacheKey() {
    return this.ucs2String;
  }
  toString() {
    return this.ucs2String;
  }
};
var Z = 1 === (null === (G = Array.from) || void 0 === G ? void 0 : G.call(Array, "\u{1F47C}").length);
var Q = null != (null === (Y = " ".codePointAt) || void 0 === Y ? void 0 : Y.call(" ", 0));
var tt = " \u{1F47C}" === (null === ($ = String.fromCodePoint) || void 0 === $ ? void 0 : $.call(String, 32, 128124));
var et;
var it;
et = Z && Q ? (t3) => Array.from(t3).map((t4) => t4.codePointAt(0)) : function(t3) {
  const e2 = [];
  let i2 = 0;
  const { length: n2 } = t3;
  for (; i2 < n2; ) {
    let r2 = t3.charCodeAt(i2++);
    if (55296 <= r2 && r2 <= 56319 && i2 < n2) {
      const e3 = t3.charCodeAt(i2++);
      56320 == (64512 & e3) ? r2 = ((1023 & r2) << 10) + (1023 & e3) + 65536 : i2--;
    }
    e2.push(r2);
  }
  return e2;
}, it = tt ? (t3) => String.fromCodePoint(...Array.from(t3 || [])) : function(t3) {
  return (() => {
    const e2 = [];
    return Array.from(t3).forEach((t4) => {
      let i2 = "";
      t4 > 65535 && (t4 -= 65536, i2 += String.fromCharCode(t4 >>> 10 & 1023 | 55296), t4 = 56320 | 1023 & t4), e2.push(i2 + String.fromCharCode(t4));
    }), e2;
  })().join("");
};
var nt = 0;
var rt = class extends q {
  static fromJSONString(t3) {
    return this.fromJSON(JSON.parse(t3));
  }
  constructor() {
    super(...arguments), this.id = ++nt;
  }
  hasSameConstructorAs(t3) {
    return this.constructor === (null == t3 ? void 0 : t3.constructor);
  }
  isEqualTo(t3) {
    return this === t3;
  }
  inspect() {
    const t3 = [], e2 = this.contentsForInspection() || {};
    for (const i2 in e2) {
      const n2 = e2[i2];
      t3.push("".concat(i2, "=").concat(n2));
    }
    return "#<".concat(this.constructor.name, ":").concat(this.id).concat(t3.length ? " ".concat(t3.join(", ")) : "", ">");
  }
  contentsForInspection() {
  }
  toJSONString() {
    return JSON.stringify(this);
  }
  toUTF16String() {
    return X.box(this);
  }
  getCacheKey() {
    return this.id.toString();
  }
};
var ot = function() {
  let t3 = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : [], e2 = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : [];
  if (t3.length !== e2.length) return false;
  for (let i2 = 0; i2 < t3.length; i2++) {
    if (t3[i2] !== e2[i2]) return false;
  }
  return true;
};
var st = function(t3) {
  const e2 = t3.slice(0);
  for (var i2 = arguments.length, n2 = new Array(i2 > 1 ? i2 - 1 : 0), r2 = 1; r2 < i2; r2++) n2[r2 - 1] = arguments[r2];
  return e2.splice(...n2), e2;
};
var at = /[\u05BE\u05C0\u05C3\u05D0-\u05EA\u05F0-\u05F4\u061B\u061F\u0621-\u063A\u0640-\u064A\u066D\u0671-\u06B7\u06BA-\u06BE\u06C0-\u06CE\u06D0-\u06D5\u06E5\u06E6\u200F\u202B\u202E\uFB1F-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE70-\uFE72\uFE74\uFE76-\uFEFC]/;
var lt = function() {
  const t3 = T("input", { dir: "auto", name: "x", dirName: "x.dir" }), e2 = T("textarea", { dir: "auto", name: "y", dirName: "y.dir" }), i2 = T("form");
  i2.appendChild(t3), i2.appendChild(e2);
  const n2 = function() {
    try {
      return new FormData(i2).has(e2.dirName);
    } catch (t4) {
      return false;
    }
  }(), r2 = function() {
    try {
      return t3.matches(":dir(ltr),:dir(rtl)");
    } catch (t4) {
      return false;
    }
  }();
  return n2 ? function(t4) {
    return e2.value = t4, new FormData(i2).get(e2.dirName);
  } : r2 ? function(e3) {
    return t3.value = e3, t3.matches(":dir(rtl)") ? "rtl" : "ltr";
  } : function(t4) {
    const e3 = t4.trim().charAt(0);
    return at.test(e3) ? "rtl" : "ltr";
  };
}();
var ct = null;
var ut = null;
var ht = null;
var dt = null;
var gt = () => (ct || (ct = bt().concat(pt())), ct);
var mt = (t3) => n[t3];
var pt = () => (ut || (ut = Object.keys(n)), ut);
var ft = (t3) => W[t3];
var bt = () => (ht || (ht = Object.keys(W)), ht);
var vt = function(t3, e2) {
  At(t3).textContent = e2.replace(/%t/g, t3);
};
var At = function(t3) {
  const e2 = document.createElement("style");
  e2.setAttribute("type", "text/css"), e2.setAttribute("data-tag-name", t3.toLowerCase());
  const i2 = yt();
  return i2 && e2.setAttribute("nonce", i2), document.head.insertBefore(e2, document.head.firstChild), e2;
};
var yt = function() {
  const t3 = xt("trix-csp-nonce") || xt("csp-nonce");
  if (t3) {
    const { nonce: e2, content: i2 } = t3;
    return "" == e2 ? i2 : e2;
  }
};
var xt = (t3) => document.head.querySelector("meta[name=".concat(t3, "]"));
var Ct = { "application/x-trix-feature-detection": "test" };
var Et = function(t3) {
  const e2 = t3.getData("text/plain"), i2 = t3.getData("text/html");
  if (!e2 || !i2) return null == e2 ? void 0 : e2.length;
  {
    const { body: t4 } = new DOMParser().parseFromString(i2, "text/html");
    if (t4.textContent === e2) return !t4.querySelector("*");
  }
};
var St = /Mac|^iP/.test(navigator.platform) ? (t3) => t3.metaKey : (t3) => t3.ctrlKey;
var Rt = (t3) => setTimeout(t3, 1);
var kt = function() {
  let t3 = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {};
  const e2 = {};
  for (const i2 in t3) {
    const n2 = t3[i2];
    e2[i2] = n2;
  }
  return e2;
};
var Tt = function() {
  let t3 = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {}, e2 = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {};
  if (Object.keys(t3).length !== Object.keys(e2).length) return false;
  for (const i2 in t3) {
    if (t3[i2] !== e2[i2]) return false;
  }
  return true;
};
var wt = function(t3) {
  if (null != t3) return Array.isArray(t3) || (t3 = [t3, t3]), [Nt(t3[0]), Nt(null != t3[1] ? t3[1] : t3[0])];
};
var Lt = function(t3) {
  if (null == t3) return;
  const [e2, i2] = wt(t3);
  return It(e2, i2);
};
var Dt = function(t3, e2) {
  if (null == t3 || null == e2) return;
  const [i2, n2] = wt(t3), [r2, o2] = wt(e2);
  return It(i2, r2) && It(n2, o2);
};
var Nt = function(t3) {
  return "number" == typeof t3 ? t3 : kt(t3);
};
var It = function(t3, e2) {
  return "number" == typeof t3 ? t3 === e2 : Tt(t3, e2);
};
var Ot = class extends q {
  constructor() {
    super(...arguments), this.update = this.update.bind(this), this.selectionManagers = [];
  }
  start() {
    this.started || (this.started = true, document.addEventListener("selectionchange", this.update, true));
  }
  stop() {
    if (this.started) return this.started = false, document.removeEventListener("selectionchange", this.update, true);
  }
  registerSelectionManager(t3) {
    if (!this.selectionManagers.includes(t3)) return this.selectionManagers.push(t3), this.start();
  }
  unregisterSelectionManager(t3) {
    if (this.selectionManagers = this.selectionManagers.filter((e2) => e2 !== t3), 0 === this.selectionManagers.length) return this.stop();
  }
  notifySelectionManagersOfSelectionChange() {
    return this.selectionManagers.map((t3) => t3.selectionDidChange());
  }
  update() {
    this.notifySelectionManagersOfSelectionChange();
  }
  reset() {
    this.update();
  }
};
var Ft = new Ot();
var Pt = function() {
  const t3 = window.getSelection();
  if (t3.rangeCount > 0) return t3;
};
var Mt = function() {
  var t3;
  const e2 = null === (t3 = Pt()) || void 0 === t3 ? void 0 : t3.getRangeAt(0);
  if (e2 && !_t(e2)) return e2;
};
var Bt = function(t3) {
  const e2 = window.getSelection();
  return e2.removeAllRanges(), e2.addRange(t3), Ft.update();
};
var _t = (t3) => jt(t3.startContainer) || jt(t3.endContainer);
var jt = (t3) => !Object.getPrototypeOf(t3);
var Wt = (t3) => t3.replace(new RegExp("".concat(d), "g"), "").replace(new RegExp("".concat(g), "g"), " ");
var Ut = new RegExp("[^\\S".concat(g, "]"));
var Vt = (t3) => t3.replace(new RegExp("".concat(Ut.source), "g"), " ").replace(/\ {2,}/g, " ");
var zt = function(t3, e2) {
  if (t3.isEqualTo(e2)) return ["", ""];
  const i2 = qt(t3, e2), { length: n2 } = i2.utf16String;
  let r2;
  if (n2) {
    const { offset: o2 } = i2, s2 = t3.codepoints.slice(0, o2).concat(t3.codepoints.slice(o2 + n2));
    r2 = qt(e2, X.fromCodepoints(s2));
  } else r2 = qt(e2, t3);
  return [i2.utf16String.toString(), r2.utf16String.toString()];
};
var qt = function(t3, e2) {
  let i2 = 0, n2 = t3.length, r2 = e2.length;
  for (; i2 < n2 && t3.charAt(i2).isEqualTo(e2.charAt(i2)); ) i2++;
  for (; n2 > i2 + 1 && t3.charAt(n2 - 1).isEqualTo(e2.charAt(r2 - 1)); ) n2--, r2--;
  return { utf16String: t3.slice(i2, n2), offset: i2 };
};
var Ht = class _Ht extends rt {
  static fromCommonAttributesOfObjects() {
    let t3 = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : [];
    if (!t3.length) return new this();
    let e2 = Yt(t3[0]), i2 = e2.getKeys();
    return t3.slice(1).forEach((t4) => {
      i2 = e2.getKeysCommonToHash(Yt(t4)), e2 = e2.slice(i2);
    }), e2;
  }
  static box(t3) {
    return Yt(t3);
  }
  constructor() {
    let t3 = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {};
    super(...arguments), this.values = Gt(t3);
  }
  add(t3, e2) {
    return this.merge(Jt(t3, e2));
  }
  remove(t3) {
    return new _Ht(Gt(this.values, t3));
  }
  get(t3) {
    return this.values[t3];
  }
  has(t3) {
    return t3 in this.values;
  }
  merge(t3) {
    return new _Ht(Kt(this.values, $t(t3)));
  }
  slice(t3) {
    const e2 = {};
    return Array.from(t3).forEach((t4) => {
      this.has(t4) && (e2[t4] = this.values[t4]);
    }), new _Ht(e2);
  }
  getKeys() {
    return Object.keys(this.values);
  }
  getKeysCommonToHash(t3) {
    return t3 = Yt(t3), this.getKeys().filter((e2) => this.values[e2] === t3.values[e2]);
  }
  isEqualTo(t3) {
    return ot(this.toArray(), Yt(t3).toArray());
  }
  isEmpty() {
    return 0 === this.getKeys().length;
  }
  toArray() {
    if (!this.array) {
      const t3 = [];
      for (const e2 in this.values) {
        const i2 = this.values[e2];
        t3.push(t3.push(e2, i2));
      }
      this.array = t3.slice(0);
    }
    return this.array;
  }
  toObject() {
    return Gt(this.values);
  }
  toJSON() {
    return this.toObject();
  }
  contentsForInspection() {
    return { values: JSON.stringify(this.values) };
  }
};
var Jt = function(t3, e2) {
  const i2 = {};
  return i2[t3] = e2, i2;
};
var Kt = function(t3, e2) {
  const i2 = Gt(t3);
  for (const t4 in e2) {
    const n2 = e2[t4];
    i2[t4] = n2;
  }
  return i2;
};
var Gt = function(t3, e2) {
  const i2 = {};
  return Object.keys(t3).sort().forEach((n2) => {
    n2 !== e2 && (i2[n2] = t3[n2]);
  }), i2;
};
var Yt = function(t3) {
  return t3 instanceof Ht ? t3 : new Ht(t3);
};
var $t = function(t3) {
  return t3 instanceof Ht ? t3.values : t3;
};
var Xt = class {
  static groupObjects() {
    let t3, e2 = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : [], { depth: i2, asTree: n2 } = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {};
    n2 && null == i2 && (i2 = 0);
    const r2 = [];
    return Array.from(e2).forEach((e3) => {
      var o2;
      if (t3) {
        var s2, a2, l2;
        if (null !== (s2 = e3.canBeGrouped) && void 0 !== s2 && s2.call(e3, i2) && null !== (a2 = (l2 = t3[t3.length - 1]).canBeGroupedWith) && void 0 !== a2 && a2.call(l2, e3, i2)) return void t3.push(e3);
        r2.push(new this(t3, { depth: i2, asTree: n2 })), t3 = null;
      }
      null !== (o2 = e3.canBeGrouped) && void 0 !== o2 && o2.call(e3, i2) ? t3 = [e3] : r2.push(e3);
    }), t3 && r2.push(new this(t3, { depth: i2, asTree: n2 })), r2;
  }
  constructor() {
    let t3 = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : [], { depth: e2, asTree: i2 } = arguments.length > 1 ? arguments[1] : void 0;
    this.objects = t3, i2 && (this.depth = e2, this.objects = this.constructor.groupObjects(this.objects, { asTree: i2, depth: this.depth + 1 }));
  }
  getObjects() {
    return this.objects;
  }
  getDepth() {
    return this.depth;
  }
  getCacheKey() {
    const t3 = ["objectGroup"];
    return Array.from(this.getObjects()).forEach((e2) => {
      t3.push(e2.getCacheKey());
    }), t3.join("/");
  }
};
var Zt = class extends q {
  constructor() {
    let t3 = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : [];
    super(...arguments), this.objects = {}, Array.from(t3).forEach((t4) => {
      const e2 = JSON.stringify(t4);
      null == this.objects[e2] && (this.objects[e2] = t4);
    });
  }
  find(t3) {
    const e2 = JSON.stringify(t3);
    return this.objects[e2];
  }
};
var Qt = class {
  constructor(t3) {
    this.reset(t3);
  }
  add(t3) {
    const e2 = te(t3);
    this.elements[e2] = t3;
  }
  remove(t3) {
    const e2 = te(t3), i2 = this.elements[e2];
    if (i2) return delete this.elements[e2], i2;
  }
  reset() {
    let t3 = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : [];
    return this.elements = {}, Array.from(t3).forEach((t4) => {
      this.add(t4);
    }), t3;
  }
};
var te = (t3) => t3.dataset.trixStoreKey;
var ee = class extends q {
  isPerforming() {
    return true === this.performing;
  }
  hasPerformed() {
    return true === this.performed;
  }
  hasSucceeded() {
    return this.performed && this.succeeded;
  }
  hasFailed() {
    return this.performed && !this.succeeded;
  }
  getPromise() {
    return this.promise || (this.promise = new Promise((t3, e2) => (this.performing = true, this.perform((i2, n2) => {
      this.succeeded = i2, this.performing = false, this.performed = true, this.succeeded ? t3(n2) : e2(n2);
    })))), this.promise;
  }
  perform(t3) {
    return t3(false);
  }
  release() {
    var t3, e2;
    null === (t3 = this.promise) || void 0 === t3 || null === (e2 = t3.cancel) || void 0 === e2 || e2.call(t3), this.promise = null, this.performing = null, this.performed = null, this.succeeded = null;
  }
};
ee.proxyMethod("getPromise().then"), ee.proxyMethod("getPromise().catch");
var ie = class extends q {
  constructor(t3) {
    let e2 = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {};
    super(...arguments), this.object = t3, this.options = e2, this.childViews = [], this.rootView = this;
  }
  getNodes() {
    return this.nodes || (this.nodes = this.createNodes()), this.nodes.map((t3) => t3.cloneNode(true));
  }
  invalidate() {
    var t3;
    return this.nodes = null, this.childViews = [], null === (t3 = this.parentView) || void 0 === t3 ? void 0 : t3.invalidate();
  }
  invalidateViewForObject(t3) {
    var e2;
    return null === (e2 = this.findViewForObject(t3)) || void 0 === e2 ? void 0 : e2.invalidate();
  }
  findOrCreateCachedChildView(t3, e2, i2) {
    let n2 = this.getCachedViewForObject(e2);
    return n2 ? this.recordChildView(n2) : (n2 = this.createChildView(...arguments), this.cacheViewForObject(n2, e2)), n2;
  }
  createChildView(t3, e2) {
    let i2 = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : {};
    e2 instanceof Xt && (i2.viewClass = t3, t3 = ne);
    const n2 = new t3(e2, i2);
    return this.recordChildView(n2);
  }
  recordChildView(t3) {
    return t3.parentView = this, t3.rootView = this.rootView, this.childViews.push(t3), t3;
  }
  getAllChildViews() {
    let t3 = [];
    return this.childViews.forEach((e2) => {
      t3.push(e2), t3 = t3.concat(e2.getAllChildViews());
    }), t3;
  }
  findElement() {
    return this.findElementForObject(this.object);
  }
  findElementForObject(t3) {
    const e2 = null == t3 ? void 0 : t3.id;
    if (e2) return this.rootView.element.querySelector("[data-trix-id='".concat(e2, "']"));
  }
  findViewForObject(t3) {
    for (const e2 of this.getAllChildViews()) if (e2.object === t3) return e2;
  }
  getViewCache() {
    return this.rootView !== this ? this.rootView.getViewCache() : this.isViewCachingEnabled() ? (this.viewCache || (this.viewCache = {}), this.viewCache) : void 0;
  }
  isViewCachingEnabled() {
    return false !== this.shouldCacheViews;
  }
  enableViewCaching() {
    this.shouldCacheViews = true;
  }
  disableViewCaching() {
    this.shouldCacheViews = false;
  }
  getCachedViewForObject(t3) {
    var e2;
    return null === (e2 = this.getViewCache()) || void 0 === e2 ? void 0 : e2[t3.getCacheKey()];
  }
  cacheViewForObject(t3, e2) {
    const i2 = this.getViewCache();
    i2 && (i2[e2.getCacheKey()] = t3);
  }
  garbageCollectCachedViews() {
    const t3 = this.getViewCache();
    if (t3) {
      const e2 = this.getAllChildViews().concat(this).map((t4) => t4.object.getCacheKey());
      for (const i2 in t3) e2.includes(i2) || delete t3[i2];
    }
  }
};
var ne = class extends ie {
  constructor() {
    super(...arguments), this.objectGroup = this.object, this.viewClass = this.options.viewClass, delete this.options.viewClass;
  }
  getChildViews() {
    return this.childViews.length || Array.from(this.objectGroup.getObjects()).forEach((t3) => {
      this.findOrCreateCachedChildView(this.viewClass, t3, this.options);
    }), this.childViews;
  }
  createNodes() {
    const t3 = this.createContainerElement();
    return this.getChildViews().forEach((e2) => {
      Array.from(e2.getNodes()).forEach((e3) => {
        t3.appendChild(e3);
      });
    }), [t3];
  }
  createContainerElement() {
    let t3 = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : this.objectGroup.getDepth();
    return this.getChildViews()[0].createContainerElement(t3);
  }
};
var { entries: re, setPrototypeOf: oe, isFrozen: se, getPrototypeOf: ae, getOwnPropertyDescriptor: le } = Object;
var { freeze: ce, seal: ue, create: he } = Object;
var { apply: de, construct: ge } = "undefined" != typeof Reflect && Reflect;
ce || (ce = function(t3) {
  return t3;
}), ue || (ue = function(t3) {
  return t3;
}), de || (de = function(t3, e2, i2) {
  return t3.apply(e2, i2);
}), ge || (ge = function(t3, e2) {
  return new t3(...e2);
});
var me = Te(Array.prototype.forEach);
var pe = Te(Array.prototype.pop);
var fe = Te(Array.prototype.push);
var be = Te(String.prototype.toLowerCase);
var ve = Te(String.prototype.toString);
var Ae = Te(String.prototype.match);
var ye = Te(String.prototype.replace);
var xe = Te(String.prototype.indexOf);
var Ce = Te(String.prototype.trim);
var Ee = Te(Object.prototype.hasOwnProperty);
var Se = Te(RegExp.prototype.test);
var Re = (ke = TypeError, function() {
  for (var t3 = arguments.length, e2 = new Array(t3), i2 = 0; i2 < t3; i2++) e2[i2] = arguments[i2];
  return ge(ke, e2);
});
var ke;
function Te(t3) {
  return function(e2) {
    for (var i2 = arguments.length, n2 = new Array(i2 > 1 ? i2 - 1 : 0), r2 = 1; r2 < i2; r2++) n2[r2 - 1] = arguments[r2];
    return de(t3, e2, n2);
  };
}
function we(t3, e2) {
  let i2 = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : be;
  oe && oe(t3, null);
  let n2 = e2.length;
  for (; n2--; ) {
    let r2 = e2[n2];
    if ("string" == typeof r2) {
      const t4 = i2(r2);
      t4 !== r2 && (se(e2) || (e2[n2] = t4), r2 = t4);
    }
    t3[r2] = true;
  }
  return t3;
}
function Le(t3) {
  for (let e2 = 0; e2 < t3.length; e2++) {
    Ee(t3, e2) || (t3[e2] = null);
  }
  return t3;
}
function De(t3) {
  const e2 = he(null);
  for (const [i2, n2] of re(t3)) {
    Ee(t3, i2) && (Array.isArray(n2) ? e2[i2] = Le(n2) : n2 && "object" == typeof n2 && n2.constructor === Object ? e2[i2] = De(n2) : e2[i2] = n2);
  }
  return e2;
}
function Ne(t3, e2) {
  for (; null !== t3; ) {
    const i2 = le(t3, e2);
    if (i2) {
      if (i2.get) return Te(i2.get);
      if ("function" == typeof i2.value) return Te(i2.value);
    }
    t3 = ae(t3);
  }
  return function() {
    return null;
  };
}
var Ie = ce(["a", "abbr", "acronym", "address", "area", "article", "aside", "audio", "b", "bdi", "bdo", "big", "blink", "blockquote", "body", "br", "button", "canvas", "caption", "center", "cite", "code", "col", "colgroup", "content", "data", "datalist", "dd", "decorator", "del", "details", "dfn", "dialog", "dir", "div", "dl", "dt", "element", "em", "fieldset", "figcaption", "figure", "font", "footer", "form", "h1", "h2", "h3", "h4", "h5", "h6", "head", "header", "hgroup", "hr", "html", "i", "img", "input", "ins", "kbd", "label", "legend", "li", "main", "map", "mark", "marquee", "menu", "menuitem", "meter", "nav", "nobr", "ol", "optgroup", "option", "output", "p", "picture", "pre", "progress", "q", "rp", "rt", "ruby", "s", "samp", "section", "select", "shadow", "small", "source", "spacer", "span", "strike", "strong", "style", "sub", "summary", "sup", "table", "tbody", "td", "template", "textarea", "tfoot", "th", "thead", "time", "tr", "track", "tt", "u", "ul", "var", "video", "wbr"]);
var Oe = ce(["svg", "a", "altglyph", "altglyphdef", "altglyphitem", "animatecolor", "animatemotion", "animatetransform", "circle", "clippath", "defs", "desc", "ellipse", "filter", "font", "g", "glyph", "glyphref", "hkern", "image", "line", "lineargradient", "marker", "mask", "metadata", "mpath", "path", "pattern", "polygon", "polyline", "radialgradient", "rect", "stop", "style", "switch", "symbol", "text", "textpath", "title", "tref", "tspan", "view", "vkern"]);
var Fe = ce(["feBlend", "feColorMatrix", "feComponentTransfer", "feComposite", "feConvolveMatrix", "feDiffuseLighting", "feDisplacementMap", "feDistantLight", "feDropShadow", "feFlood", "feFuncA", "feFuncB", "feFuncG", "feFuncR", "feGaussianBlur", "feImage", "feMerge", "feMergeNode", "feMorphology", "feOffset", "fePointLight", "feSpecularLighting", "feSpotLight", "feTile", "feTurbulence"]);
var Pe = ce(["animate", "color-profile", "cursor", "discard", "font-face", "font-face-format", "font-face-name", "font-face-src", "font-face-uri", "foreignobject", "hatch", "hatchpath", "mesh", "meshgradient", "meshpatch", "meshrow", "missing-glyph", "script", "set", "solidcolor", "unknown", "use"]);
var Me = ce(["math", "menclose", "merror", "mfenced", "mfrac", "mglyph", "mi", "mlabeledtr", "mmultiscripts", "mn", "mo", "mover", "mpadded", "mphantom", "mroot", "mrow", "ms", "mspace", "msqrt", "mstyle", "msub", "msup", "msubsup", "mtable", "mtd", "mtext", "mtr", "munder", "munderover", "mprescripts"]);
var Be = ce(["maction", "maligngroup", "malignmark", "mlongdiv", "mscarries", "mscarry", "msgroup", "mstack", "msline", "msrow", "semantics", "annotation", "annotation-xml", "mprescripts", "none"]);
var _e = ce(["#text"]);
var je = ce(["accept", "action", "align", "alt", "autocapitalize", "autocomplete", "autopictureinpicture", "autoplay", "background", "bgcolor", "border", "capture", "cellpadding", "cellspacing", "checked", "cite", "class", "clear", "color", "cols", "colspan", "controls", "controlslist", "coords", "crossorigin", "datetime", "decoding", "default", "dir", "disabled", "disablepictureinpicture", "disableremoteplayback", "download", "draggable", "enctype", "enterkeyhint", "face", "for", "headers", "height", "hidden", "high", "href", "hreflang", "id", "inputmode", "integrity", "ismap", "kind", "label", "lang", "list", "loading", "loop", "low", "max", "maxlength", "media", "method", "min", "minlength", "multiple", "muted", "name", "nonce", "noshade", "novalidate", "nowrap", "open", "optimum", "pattern", "placeholder", "playsinline", "popover", "popovertarget", "popovertargetaction", "poster", "preload", "pubdate", "radiogroup", "readonly", "rel", "required", "rev", "reversed", "role", "rows", "rowspan", "spellcheck", "scope", "selected", "shape", "size", "sizes", "span", "srclang", "start", "src", "srcset", "step", "style", "summary", "tabindex", "title", "translate", "type", "usemap", "valign", "value", "width", "wrap", "xmlns", "slot"]);
var We = ce(["accent-height", "accumulate", "additive", "alignment-baseline", "amplitude", "ascent", "attributename", "attributetype", "azimuth", "basefrequency", "baseline-shift", "begin", "bias", "by", "class", "clip", "clippathunits", "clip-path", "clip-rule", "color", "color-interpolation", "color-interpolation-filters", "color-profile", "color-rendering", "cx", "cy", "d", "dx", "dy", "diffuseconstant", "direction", "display", "divisor", "dur", "edgemode", "elevation", "end", "exponent", "fill", "fill-opacity", "fill-rule", "filter", "filterunits", "flood-color", "flood-opacity", "font-family", "font-size", "font-size-adjust", "font-stretch", "font-style", "font-variant", "font-weight", "fx", "fy", "g1", "g2", "glyph-name", "glyphref", "gradientunits", "gradienttransform", "height", "href", "id", "image-rendering", "in", "in2", "intercept", "k", "k1", "k2", "k3", "k4", "kerning", "keypoints", "keysplines", "keytimes", "lang", "lengthadjust", "letter-spacing", "kernelmatrix", "kernelunitlength", "lighting-color", "local", "marker-end", "marker-mid", "marker-start", "markerheight", "markerunits", "markerwidth", "maskcontentunits", "maskunits", "max", "mask", "media", "method", "mode", "min", "name", "numoctaves", "offset", "operator", "opacity", "order", "orient", "orientation", "origin", "overflow", "paint-order", "path", "pathlength", "patterncontentunits", "patterntransform", "patternunits", "points", "preservealpha", "preserveaspectratio", "primitiveunits", "r", "rx", "ry", "radius", "refx", "refy", "repeatcount", "repeatdur", "restart", "result", "rotate", "scale", "seed", "shape-rendering", "slope", "specularconstant", "specularexponent", "spreadmethod", "startoffset", "stddeviation", "stitchtiles", "stop-color", "stop-opacity", "stroke-dasharray", "stroke-dashoffset", "stroke-linecap", "stroke-linejoin", "stroke-miterlimit", "stroke-opacity", "stroke", "stroke-width", "style", "surfacescale", "systemlanguage", "tabindex", "tablevalues", "targetx", "targety", "transform", "transform-origin", "text-anchor", "text-decoration", "text-rendering", "textlength", "type", "u1", "u2", "unicode", "values", "viewbox", "visibility", "version", "vert-adv-y", "vert-origin-x", "vert-origin-y", "width", "word-spacing", "wrap", "writing-mode", "xchannelselector", "ychannelselector", "x", "x1", "x2", "xmlns", "y", "y1", "y2", "z", "zoomandpan"]);
var Ue = ce(["accent", "accentunder", "align", "bevelled", "close", "columnsalign", "columnlines", "columnspan", "denomalign", "depth", "dir", "display", "displaystyle", "encoding", "fence", "frame", "height", "href", "id", "largeop", "length", "linethickness", "lspace", "lquote", "mathbackground", "mathcolor", "mathsize", "mathvariant", "maxsize", "minsize", "movablelimits", "notation", "numalign", "open", "rowalign", "rowlines", "rowspacing", "rowspan", "rspace", "rquote", "scriptlevel", "scriptminsize", "scriptsizemultiplier", "selection", "separator", "separators", "stretchy", "subscriptshift", "supscriptshift", "symmetric", "voffset", "width", "xmlns"]);
var Ve = ce(["xlink:href", "xml:id", "xlink:title", "xml:space", "xmlns:xlink"]);
var ze = ue(/\{\{[\w\W]*|[\w\W]*\}\}/gm);
var qe = ue(/<%[\w\W]*|[\w\W]*%>/gm);
var He = ue(/\$\{[\w\W]*}/gm);
var Je = ue(/^data-[\-\w.\u00B7-\uFFFF]+$/);
var Ke = ue(/^aria-[\-\w]+$/);
var Ge = ue(/^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i);
var Ye = ue(/^(?:\w+script|data):/i);
var $e = ue(/[\u0000-\u0020\u00A0\u1680\u180E\u2000-\u2029\u205F\u3000]/g);
var Xe = ue(/^html$/i);
var Ze = ue(/^[a-z][.\w]*(-[.\w]+)+$/i);
var Qe = Object.freeze({ __proto__: null, ARIA_ATTR: Ke, ATTR_WHITESPACE: $e, CUSTOM_ELEMENT: Ze, DATA_ATTR: Je, DOCTYPE_NAME: Xe, ERB_EXPR: qe, IS_ALLOWED_URI: Ge, IS_SCRIPT_OR_DATA: Ye, MUSTACHE_EXPR: ze, TMPLIT_EXPR: He });
var ti = 1;
var ei = 3;
var ii = 7;
var ni = 8;
var ri = 9;
var oi = function() {
  return "undefined" == typeof window ? null : window;
};
var si = function t2() {
  let e2 = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : oi();
  const i2 = (e3) => t2(e3);
  if (i2.version = "3.2.3", i2.removed = [], !e2 || !e2.document || e2.document.nodeType !== ri) return i2.isSupported = false, i2;
  let { document: n2 } = e2;
  const r2 = n2, o2 = r2.currentScript, { DocumentFragment: s2, HTMLTemplateElement: a2, Node: l2, Element: c2, NodeFilter: u2, NamedNodeMap: h2 = e2.NamedNodeMap || e2.MozNamedAttrMap, HTMLFormElement: d2, DOMParser: g2, trustedTypes: m2 } = e2, p2 = c2.prototype, f2 = Ne(p2, "cloneNode"), b2 = Ne(p2, "remove"), v2 = Ne(p2, "nextSibling"), A2 = Ne(p2, "childNodes"), y2 = Ne(p2, "parentNode");
  if ("function" == typeof a2) {
    const t3 = n2.createElement("template");
    t3.content && t3.content.ownerDocument && (n2 = t3.content.ownerDocument);
  }
  let x2, C2 = "";
  const { implementation: E2, createNodeIterator: S2, createDocumentFragment: R2, getElementsByTagName: k2 } = n2, { importNode: T2 } = r2;
  let w2 = { afterSanitizeAttributes: [], afterSanitizeElements: [], afterSanitizeShadowDOM: [], beforeSanitizeAttributes: [], beforeSanitizeElements: [], beforeSanitizeShadowDOM: [], uponSanitizeAttribute: [], uponSanitizeElement: [], uponSanitizeShadowNode: [] };
  i2.isSupported = "function" == typeof re && "function" == typeof y2 && E2 && void 0 !== E2.createHTMLDocument;
  const { MUSTACHE_EXPR: L2, ERB_EXPR: D2, TMPLIT_EXPR: N2, DATA_ATTR: I2, ARIA_ATTR: O2, IS_SCRIPT_OR_DATA: F2, ATTR_WHITESPACE: P2, CUSTOM_ELEMENT: M2 } = Qe;
  let { IS_ALLOWED_URI: B2 } = Qe, _2 = null;
  const j2 = we({}, [...Ie, ...Oe, ...Fe, ...Me, ..._e]);
  let W2 = null;
  const U2 = we({}, [...je, ...We, ...Ue, ...Ve]);
  let V2 = Object.seal(he(null, { tagNameCheck: { writable: true, configurable: false, enumerable: true, value: null }, attributeNameCheck: { writable: true, configurable: false, enumerable: true, value: null }, allowCustomizedBuiltInElements: { writable: true, configurable: false, enumerable: true, value: false } })), z2 = null, q2 = null, H2 = true, J2 = true, K2 = false, G2 = true, Y2 = false, $2 = true, X2 = false, Z2 = false, Q2 = false, tt2 = false, et2 = false, it2 = false, nt2 = true, rt2 = false, ot2 = true, st2 = false, at2 = {}, lt2 = null;
  const ct2 = we({}, ["annotation-xml", "audio", "colgroup", "desc", "foreignobject", "head", "iframe", "math", "mi", "mn", "mo", "ms", "mtext", "noembed", "noframes", "noscript", "plaintext", "script", "style", "svg", "template", "thead", "title", "video", "xmp"]);
  let ut2 = null;
  const ht2 = we({}, ["audio", "video", "img", "source", "image", "track"]);
  let dt2 = null;
  const gt2 = we({}, ["alt", "class", "for", "id", "label", "name", "pattern", "placeholder", "role", "summary", "title", "value", "style", "xmlns"]), mt2 = "http://www.w3.org/1998/Math/MathML", pt2 = "http://www.w3.org/2000/svg", ft2 = "http://www.w3.org/1999/xhtml";
  let bt2 = ft2, vt2 = false, At2 = null;
  const yt2 = we({}, [mt2, pt2, ft2], ve);
  let xt2 = we({}, ["mi", "mo", "mn", "ms", "mtext"]), Ct2 = we({}, ["annotation-xml"]);
  const Et2 = we({}, ["title", "style", "font", "a", "script"]);
  let St2 = null;
  const Rt2 = ["application/xhtml+xml", "text/html"];
  let kt2 = null, Tt2 = null;
  const wt2 = n2.createElement("form"), Lt2 = function(t3) {
    return t3 instanceof RegExp || t3 instanceof Function;
  }, Dt2 = function() {
    let t3 = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {};
    if (!Tt2 || Tt2 !== t3) {
      if (t3 && "object" == typeof t3 || (t3 = {}), t3 = De(t3), St2 = -1 === Rt2.indexOf(t3.PARSER_MEDIA_TYPE) ? "text/html" : t3.PARSER_MEDIA_TYPE, kt2 = "application/xhtml+xml" === St2 ? ve : be, _2 = Ee(t3, "ALLOWED_TAGS") ? we({}, t3.ALLOWED_TAGS, kt2) : j2, W2 = Ee(t3, "ALLOWED_ATTR") ? we({}, t3.ALLOWED_ATTR, kt2) : U2, At2 = Ee(t3, "ALLOWED_NAMESPACES") ? we({}, t3.ALLOWED_NAMESPACES, ve) : yt2, dt2 = Ee(t3, "ADD_URI_SAFE_ATTR") ? we(De(gt2), t3.ADD_URI_SAFE_ATTR, kt2) : gt2, ut2 = Ee(t3, "ADD_DATA_URI_TAGS") ? we(De(ht2), t3.ADD_DATA_URI_TAGS, kt2) : ht2, lt2 = Ee(t3, "FORBID_CONTENTS") ? we({}, t3.FORBID_CONTENTS, kt2) : ct2, z2 = Ee(t3, "FORBID_TAGS") ? we({}, t3.FORBID_TAGS, kt2) : {}, q2 = Ee(t3, "FORBID_ATTR") ? we({}, t3.FORBID_ATTR, kt2) : {}, at2 = !!Ee(t3, "USE_PROFILES") && t3.USE_PROFILES, H2 = false !== t3.ALLOW_ARIA_ATTR, J2 = false !== t3.ALLOW_DATA_ATTR, K2 = t3.ALLOW_UNKNOWN_PROTOCOLS || false, G2 = false !== t3.ALLOW_SELF_CLOSE_IN_ATTR, Y2 = t3.SAFE_FOR_TEMPLATES || false, $2 = false !== t3.SAFE_FOR_XML, X2 = t3.WHOLE_DOCUMENT || false, tt2 = t3.RETURN_DOM || false, et2 = t3.RETURN_DOM_FRAGMENT || false, it2 = t3.RETURN_TRUSTED_TYPE || false, Q2 = t3.FORCE_BODY || false, nt2 = false !== t3.SANITIZE_DOM, rt2 = t3.SANITIZE_NAMED_PROPS || false, ot2 = false !== t3.KEEP_CONTENT, st2 = t3.IN_PLACE || false, B2 = t3.ALLOWED_URI_REGEXP || Ge, bt2 = t3.NAMESPACE || ft2, xt2 = t3.MATHML_TEXT_INTEGRATION_POINTS || xt2, Ct2 = t3.HTML_INTEGRATION_POINTS || Ct2, V2 = t3.CUSTOM_ELEMENT_HANDLING || {}, t3.CUSTOM_ELEMENT_HANDLING && Lt2(t3.CUSTOM_ELEMENT_HANDLING.tagNameCheck) && (V2.tagNameCheck = t3.CUSTOM_ELEMENT_HANDLING.tagNameCheck), t3.CUSTOM_ELEMENT_HANDLING && Lt2(t3.CUSTOM_ELEMENT_HANDLING.attributeNameCheck) && (V2.attributeNameCheck = t3.CUSTOM_ELEMENT_HANDLING.attributeNameCheck), t3.CUSTOM_ELEMENT_HANDLING && "boolean" == typeof t3.CUSTOM_ELEMENT_HANDLING.allowCustomizedBuiltInElements && (V2.allowCustomizedBuiltInElements = t3.CUSTOM_ELEMENT_HANDLING.allowCustomizedBuiltInElements), Y2 && (J2 = false), et2 && (tt2 = true), at2 && (_2 = we({}, _e), W2 = [], true === at2.html && (we(_2, Ie), we(W2, je)), true === at2.svg && (we(_2, Oe), we(W2, We), we(W2, Ve)), true === at2.svgFilters && (we(_2, Fe), we(W2, We), we(W2, Ve)), true === at2.mathMl && (we(_2, Me), we(W2, Ue), we(W2, Ve))), t3.ADD_TAGS && (_2 === j2 && (_2 = De(_2)), we(_2, t3.ADD_TAGS, kt2)), t3.ADD_ATTR && (W2 === U2 && (W2 = De(W2)), we(W2, t3.ADD_ATTR, kt2)), t3.ADD_URI_SAFE_ATTR && we(dt2, t3.ADD_URI_SAFE_ATTR, kt2), t3.FORBID_CONTENTS && (lt2 === ct2 && (lt2 = De(lt2)), we(lt2, t3.FORBID_CONTENTS, kt2)), ot2 && (_2["#text"] = true), X2 && we(_2, ["html", "head", "body"]), _2.table && (we(_2, ["tbody"]), delete z2.tbody), t3.TRUSTED_TYPES_POLICY) {
        if ("function" != typeof t3.TRUSTED_TYPES_POLICY.createHTML) throw Re('TRUSTED_TYPES_POLICY configuration option must provide a "createHTML" hook.');
        if ("function" != typeof t3.TRUSTED_TYPES_POLICY.createScriptURL) throw Re('TRUSTED_TYPES_POLICY configuration option must provide a "createScriptURL" hook.');
        x2 = t3.TRUSTED_TYPES_POLICY, C2 = x2.createHTML("");
      } else void 0 === x2 && (x2 = function(t4, e3) {
        if ("object" != typeof t4 || "function" != typeof t4.createPolicy) return null;
        let i3 = null;
        const n3 = "data-tt-policy-suffix";
        e3 && e3.hasAttribute(n3) && (i3 = e3.getAttribute(n3));
        const r3 = "dompurify" + (i3 ? "#" + i3 : "");
        try {
          return t4.createPolicy(r3, { createHTML: (t5) => t5, createScriptURL: (t5) => t5 });
        } catch (t5) {
          return console.warn("TrustedTypes policy " + r3 + " could not be created."), null;
        }
      }(m2, o2)), null !== x2 && "string" == typeof C2 && (C2 = x2.createHTML(""));
      ce && ce(t3), Tt2 = t3;
    }
  }, Nt2 = we({}, [...Oe, ...Fe, ...Pe]), It2 = we({}, [...Me, ...Be]), Ot2 = function(t3) {
    fe(i2.removed, { element: t3 });
    try {
      y2(t3).removeChild(t3);
    } catch (e3) {
      b2(t3);
    }
  }, Ft2 = function(t3, e3) {
    try {
      fe(i2.removed, { attribute: e3.getAttributeNode(t3), from: e3 });
    } catch (t4) {
      fe(i2.removed, { attribute: null, from: e3 });
    }
    if (e3.removeAttribute(t3), "is" === t3) if (tt2 || et2) try {
      Ot2(e3);
    } catch (t4) {
    }
    else try {
      e3.setAttribute(t3, "");
    } catch (t4) {
    }
  }, Pt2 = function(t3) {
    let e3 = null, i3 = null;
    if (Q2) t3 = "<remove></remove>" + t3;
    else {
      const e4 = Ae(t3, /^[\r\n\t ]+/);
      i3 = e4 && e4[0];
    }
    "application/xhtml+xml" === St2 && bt2 === ft2 && (t3 = '<html xmlns="http://www.w3.org/1999/xhtml"><head></head><body>' + t3 + "</body></html>");
    const r3 = x2 ? x2.createHTML(t3) : t3;
    if (bt2 === ft2) try {
      e3 = new g2().parseFromString(r3, St2);
    } catch (t4) {
    }
    if (!e3 || !e3.documentElement) {
      e3 = E2.createDocument(bt2, "template", null);
      try {
        e3.documentElement.innerHTML = vt2 ? C2 : r3;
      } catch (t4) {
      }
    }
    const o3 = e3.body || e3.documentElement;
    return t3 && i3 && o3.insertBefore(n2.createTextNode(i3), o3.childNodes[0] || null), bt2 === ft2 ? k2.call(e3, X2 ? "html" : "body")[0] : X2 ? e3.documentElement : o3;
  }, Mt2 = function(t3) {
    return S2.call(t3.ownerDocument || t3, t3, u2.SHOW_ELEMENT | u2.SHOW_COMMENT | u2.SHOW_TEXT | u2.SHOW_PROCESSING_INSTRUCTION | u2.SHOW_CDATA_SECTION, null);
  }, Bt2 = function(t3) {
    return t3 instanceof d2 && ("string" != typeof t3.nodeName || "string" != typeof t3.textContent || "function" != typeof t3.removeChild || !(t3.attributes instanceof h2) || "function" != typeof t3.removeAttribute || "function" != typeof t3.setAttribute || "string" != typeof t3.namespaceURI || "function" != typeof t3.insertBefore || "function" != typeof t3.hasChildNodes);
  }, _t2 = function(t3) {
    return "function" == typeof l2 && t3 instanceof l2;
  };
  function jt2(t3, e3, n3) {
    me(t3, (t4) => {
      t4.call(i2, e3, n3, Tt2);
    });
  }
  const Wt2 = function(t3) {
    let e3 = null;
    if (jt2(w2.beforeSanitizeElements, t3, null), Bt2(t3)) return Ot2(t3), true;
    const n3 = kt2(t3.nodeName);
    if (jt2(w2.uponSanitizeElement, t3, { tagName: n3, allowedTags: _2 }), t3.hasChildNodes() && !_t2(t3.firstElementChild) && Se(/<[/\w]/g, t3.innerHTML) && Se(/<[/\w]/g, t3.textContent)) return Ot2(t3), true;
    if (t3.nodeType === ii) return Ot2(t3), true;
    if ($2 && t3.nodeType === ni && Se(/<[/\w]/g, t3.data)) return Ot2(t3), true;
    if (!_2[n3] || z2[n3]) {
      if (!z2[n3] && Vt2(n3)) {
        if (V2.tagNameCheck instanceof RegExp && Se(V2.tagNameCheck, n3)) return false;
        if (V2.tagNameCheck instanceof Function && V2.tagNameCheck(n3)) return false;
      }
      if (ot2 && !lt2[n3]) {
        const e4 = y2(t3) || t3.parentNode, i3 = A2(t3) || t3.childNodes;
        if (i3 && e4) {
          for (let n4 = i3.length - 1; n4 >= 0; --n4) {
            const r3 = f2(i3[n4], true);
            r3.__removalCount = (t3.__removalCount || 0) + 1, e4.insertBefore(r3, v2(t3));
          }
        }
      }
      return Ot2(t3), true;
    }
    return t3 instanceof c2 && !function(t4) {
      let e4 = y2(t4);
      e4 && e4.tagName || (e4 = { namespaceURI: bt2, tagName: "template" });
      const i3 = be(t4.tagName), n4 = be(e4.tagName);
      return !!At2[t4.namespaceURI] && (t4.namespaceURI === pt2 ? e4.namespaceURI === ft2 ? "svg" === i3 : e4.namespaceURI === mt2 ? "svg" === i3 && ("annotation-xml" === n4 || xt2[n4]) : Boolean(Nt2[i3]) : t4.namespaceURI === mt2 ? e4.namespaceURI === ft2 ? "math" === i3 : e4.namespaceURI === pt2 ? "math" === i3 && Ct2[n4] : Boolean(It2[i3]) : t4.namespaceURI === ft2 ? !(e4.namespaceURI === pt2 && !Ct2[n4]) && !(e4.namespaceURI === mt2 && !xt2[n4]) && !It2[i3] && (Et2[i3] || !Nt2[i3]) : !("application/xhtml+xml" !== St2 || !At2[t4.namespaceURI]));
    }(t3) ? (Ot2(t3), true) : "noscript" !== n3 && "noembed" !== n3 && "noframes" !== n3 || !Se(/<\/no(script|embed|frames)/i, t3.innerHTML) ? (Y2 && t3.nodeType === ei && (e3 = t3.textContent, me([L2, D2, N2], (t4) => {
      e3 = ye(e3, t4, " ");
    }), t3.textContent !== e3 && (fe(i2.removed, { element: t3.cloneNode() }), t3.textContent = e3)), jt2(w2.afterSanitizeElements, t3, null), false) : (Ot2(t3), true);
  }, Ut2 = function(t3, e3, i3) {
    if (nt2 && ("id" === e3 || "name" === e3) && (i3 in n2 || i3 in wt2)) return false;
    if (J2 && !q2[e3] && Se(I2, e3)) ;
    else if (H2 && Se(O2, e3)) ;
    else if (!W2[e3] || q2[e3]) {
      if (!(Vt2(t3) && (V2.tagNameCheck instanceof RegExp && Se(V2.tagNameCheck, t3) || V2.tagNameCheck instanceof Function && V2.tagNameCheck(t3)) && (V2.attributeNameCheck instanceof RegExp && Se(V2.attributeNameCheck, e3) || V2.attributeNameCheck instanceof Function && V2.attributeNameCheck(e3)) || "is" === e3 && V2.allowCustomizedBuiltInElements && (V2.tagNameCheck instanceof RegExp && Se(V2.tagNameCheck, i3) || V2.tagNameCheck instanceof Function && V2.tagNameCheck(i3)))) return false;
    } else if (dt2[e3]) ;
    else if (Se(B2, ye(i3, P2, ""))) ;
    else if ("src" !== e3 && "xlink:href" !== e3 && "href" !== e3 || "script" === t3 || 0 !== xe(i3, "data:") || !ut2[t3]) {
      if (K2 && !Se(F2, ye(i3, P2, ""))) ;
      else if (i3) return false;
    } else ;
    return true;
  }, Vt2 = function(t3) {
    return "annotation-xml" !== t3 && Ae(t3, M2);
  }, zt2 = function(t3) {
    jt2(w2.beforeSanitizeAttributes, t3, null);
    const { attributes: e3 } = t3;
    if (!e3 || Bt2(t3)) return;
    const n3 = { attrName: "", attrValue: "", keepAttr: true, allowedAttributes: W2, forceKeepAttr: void 0 };
    let r3 = e3.length;
    for (; r3--; ) {
      const o3 = e3[r3], { name: s3, namespaceURI: a3, value: l3 } = o3, c3 = kt2(s3);
      let u3 = "value" === s3 ? l3 : Ce(l3);
      if (n3.attrName = c3, n3.attrValue = u3, n3.keepAttr = true, n3.forceKeepAttr = void 0, jt2(w2.uponSanitizeAttribute, t3, n3), u3 = n3.attrValue, !rt2 || "id" !== c3 && "name" !== c3 || (Ft2(s3, t3), u3 = "user-content-" + u3), $2 && Se(/((--!?|])>)|<\/(style|title)/i, u3)) {
        Ft2(s3, t3);
        continue;
      }
      if (n3.forceKeepAttr) continue;
      if (Ft2(s3, t3), !n3.keepAttr) continue;
      if (!G2 && Se(/\/>/i, u3)) {
        Ft2(s3, t3);
        continue;
      }
      Y2 && me([L2, D2, N2], (t4) => {
        u3 = ye(u3, t4, " ");
      });
      const h3 = kt2(t3.nodeName);
      if (Ut2(h3, c3, u3)) {
        if (x2 && "object" == typeof m2 && "function" == typeof m2.getAttributeType) if (a3) ;
        else switch (m2.getAttributeType(h3, c3)) {
          case "TrustedHTML":
            u3 = x2.createHTML(u3);
            break;
          case "TrustedScriptURL":
            u3 = x2.createScriptURL(u3);
        }
        try {
          a3 ? t3.setAttributeNS(a3, s3, u3) : t3.setAttribute(s3, u3), Bt2(t3) ? Ot2(t3) : pe(i2.removed);
        } catch (t4) {
        }
      }
    }
    jt2(w2.afterSanitizeAttributes, t3, null);
  }, qt2 = function t3(e3) {
    let i3 = null;
    const n3 = Mt2(e3);
    for (jt2(w2.beforeSanitizeShadowDOM, e3, null); i3 = n3.nextNode(); ) jt2(w2.uponSanitizeShadowNode, i3, null), Wt2(i3), zt2(i3), i3.content instanceof s2 && t3(i3.content);
    jt2(w2.afterSanitizeShadowDOM, e3, null);
  };
  return i2.sanitize = function(t3) {
    let e3 = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {}, n3 = null, o3 = null, a3 = null, c3 = null;
    if (vt2 = !t3, vt2 && (t3 = "<!-->"), "string" != typeof t3 && !_t2(t3)) {
      if ("function" != typeof t3.toString) throw Re("toString is not a function");
      if ("string" != typeof (t3 = t3.toString())) throw Re("dirty is not a string, aborting");
    }
    if (!i2.isSupported) return t3;
    if (Z2 || Dt2(e3), i2.removed = [], "string" == typeof t3 && (st2 = false), st2) {
      if (t3.nodeName) {
        const e4 = kt2(t3.nodeName);
        if (!_2[e4] || z2[e4]) throw Re("root node is forbidden and cannot be sanitized in-place");
      }
    } else if (t3 instanceof l2) n3 = Pt2("<!---->"), o3 = n3.ownerDocument.importNode(t3, true), o3.nodeType === ti && "BODY" === o3.nodeName || "HTML" === o3.nodeName ? n3 = o3 : n3.appendChild(o3);
    else {
      if (!tt2 && !Y2 && !X2 && -1 === t3.indexOf("<")) return x2 && it2 ? x2.createHTML(t3) : t3;
      if (n3 = Pt2(t3), !n3) return tt2 ? null : it2 ? C2 : "";
    }
    n3 && Q2 && Ot2(n3.firstChild);
    const u3 = Mt2(st2 ? t3 : n3);
    for (; a3 = u3.nextNode(); ) Wt2(a3), zt2(a3), a3.content instanceof s2 && qt2(a3.content);
    if (st2) return t3;
    if (tt2) {
      if (et2) for (c3 = R2.call(n3.ownerDocument); n3.firstChild; ) c3.appendChild(n3.firstChild);
      else c3 = n3;
      return (W2.shadowroot || W2.shadowrootmode) && (c3 = T2.call(r2, c3, true)), c3;
    }
    let h3 = X2 ? n3.outerHTML : n3.innerHTML;
    return X2 && _2["!doctype"] && n3.ownerDocument && n3.ownerDocument.doctype && n3.ownerDocument.doctype.name && Se(Xe, n3.ownerDocument.doctype.name) && (h3 = "<!DOCTYPE " + n3.ownerDocument.doctype.name + ">\n" + h3), Y2 && me([L2, D2, N2], (t4) => {
      h3 = ye(h3, t4, " ");
    }), x2 && it2 ? x2.createHTML(h3) : h3;
  }, i2.setConfig = function() {
    Dt2(arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {}), Z2 = true;
  }, i2.clearConfig = function() {
    Tt2 = null, Z2 = false;
  }, i2.isValidAttribute = function(t3, e3, i3) {
    Tt2 || Dt2({});
    const n3 = kt2(t3), r3 = kt2(e3);
    return Ut2(n3, r3, i3);
  }, i2.addHook = function(t3, e3) {
    "function" == typeof e3 && fe(w2[t3], e3);
  }, i2.removeHook = function(t3) {
    return pe(w2[t3]);
  }, i2.removeHooks = function(t3) {
    w2[t3] = [];
  }, i2.removeAllHooks = function() {
    w2 = { afterSanitizeAttributes: [], afterSanitizeElements: [], afterSanitizeShadowDOM: [], beforeSanitizeAttributes: [], beforeSanitizeElements: [], beforeSanitizeShadowDOM: [], uponSanitizeAttribute: [], uponSanitizeElement: [], uponSanitizeShadowNode: [] };
  }, i2;
}();
si.addHook("uponSanitizeAttribute", function(t3, e2) {
  /^data-trix-/.test(e2.attrName) && (e2.forceKeepAttr = true);
});
var ai = "style href src width height language class".split(" ");
var li = "javascript:".split(" ");
var ci = "script iframe form noscript".split(" ");
var ui = class extends q {
  static setHTML(t3, e2) {
    const i2 = new this(e2).sanitize(), n2 = i2.getHTML ? i2.getHTML() : i2.outerHTML;
    t3.innerHTML = n2;
  }
  static sanitize(t3, e2) {
    const i2 = new this(t3, e2);
    return i2.sanitize(), i2;
  }
  constructor(t3) {
    let { allowedAttributes: e2, forbiddenProtocols: i2, forbiddenElements: n2 } = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {};
    super(...arguments), this.allowedAttributes = e2 || ai, this.forbiddenProtocols = i2 || li, this.forbiddenElements = n2 || ci, this.body = hi(t3);
  }
  sanitize() {
    return this.sanitizeElements(), this.normalizeListElementNesting(), si.setConfig(l), this.body = si.sanitize(this.body), this.body;
  }
  getHTML() {
    return this.body.innerHTML;
  }
  getBody() {
    return this.body;
  }
  sanitizeElements() {
    const t3 = R(this.body), e2 = [];
    for (; t3.nextNode(); ) {
      const i2 = t3.currentNode;
      switch (i2.nodeType) {
        case Node.ELEMENT_NODE:
          this.elementIsRemovable(i2) ? e2.push(i2) : this.sanitizeElement(i2);
          break;
        case Node.COMMENT_NODE:
          e2.push(i2);
      }
    }
    return e2.forEach((t4) => S(t4)), this.body;
  }
  sanitizeElement(t3) {
    return t3.hasAttribute("href") && this.forbiddenProtocols.includes(t3.protocol) && t3.removeAttribute("href"), Array.from(t3.attributes).forEach((e2) => {
      let { name: i2 } = e2;
      this.allowedAttributes.includes(i2) || 0 === i2.indexOf("data-trix") || t3.removeAttribute(i2);
    }), t3;
  }
  normalizeListElementNesting() {
    return Array.from(this.body.querySelectorAll("ul,ol")).forEach((t3) => {
      const e2 = t3.previousElementSibling;
      e2 && "li" === k(e2) && e2.appendChild(t3);
    }), this.body;
  }
  elementIsRemovable(t3) {
    if ((null == t3 ? void 0 : t3.nodeType) === Node.ELEMENT_NODE) return this.elementIsForbidden(t3) || this.elementIsntSerializable(t3);
  }
  elementIsForbidden(t3) {
    return this.forbiddenElements.includes(k(t3));
  }
  elementIsntSerializable(t3) {
    return "false" === t3.getAttribute("data-trix-serialize") && !P(t3);
  }
};
var hi = function() {
  let t3 = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : "";
  t3 = t3.replace(/<\/html[^>]*>[^]*$/i, "</html>");
  const e2 = document.implementation.createHTMLDocument("");
  return e2.documentElement.innerHTML = t3, Array.from(e2.head.querySelectorAll("style")).forEach((t4) => {
    e2.body.appendChild(t4);
  }), e2.body;
};
var { css: di } = z;
var gi = class extends ie {
  constructor() {
    super(...arguments), this.attachment = this.object, this.attachment.uploadProgressDelegate = this, this.attachmentPiece = this.options.piece;
  }
  createContentNodes() {
    return [];
  }
  createNodes() {
    let t3;
    const e2 = t3 = T({ tagName: "figure", className: this.getClassName(), data: this.getData(), editable: false }), i2 = this.getHref();
    return i2 && (t3 = T({ tagName: "a", editable: false, attributes: { href: i2, tabindex: -1 } }), e2.appendChild(t3)), this.attachment.hasContent() ? ui.setHTML(t3, this.attachment.getContent()) : this.createContentNodes().forEach((e3) => {
      t3.appendChild(e3);
    }), t3.appendChild(this.createCaptionElement()), this.attachment.isPending() && (this.progressElement = T({ tagName: "progress", attributes: { class: di.attachmentProgress, value: this.attachment.getUploadProgress(), max: 100 }, data: { trixMutable: true, trixStoreKey: ["progressElement", this.attachment.id].join("/") } }), e2.appendChild(this.progressElement)), [mi("left"), e2, mi("right")];
  }
  createCaptionElement() {
    const t3 = T({ tagName: "figcaption", className: di.attachmentCaption }), e2 = this.attachmentPiece.getCaption();
    if (e2) t3.classList.add("".concat(di.attachmentCaption, "--edited")), t3.textContent = e2;
    else {
      let e3, i2;
      const n2 = this.getCaptionConfig();
      if (n2.name && (e3 = this.attachment.getFilename()), n2.size && (i2 = this.attachment.getFormattedFilesize()), e3) {
        const i3 = T({ tagName: "span", className: di.attachmentName, textContent: e3 });
        t3.appendChild(i3);
      }
      if (i2) {
        e3 && t3.appendChild(document.createTextNode(" "));
        const n3 = T({ tagName: "span", className: di.attachmentSize, textContent: i2 });
        t3.appendChild(n3);
      }
    }
    return t3;
  }
  getClassName() {
    const t3 = [di.attachment, "".concat(di.attachment, "--").concat(this.attachment.getType())], e2 = this.attachment.getExtension();
    return e2 && t3.push("".concat(di.attachment, "--").concat(e2)), t3.join(" ");
  }
  getData() {
    const t3 = { trixAttachment: JSON.stringify(this.attachment), trixContentType: this.attachment.getContentType(), trixId: this.attachment.id }, { attributes: e2 } = this.attachmentPiece;
    return e2.isEmpty() || (t3.trixAttributes = JSON.stringify(e2)), this.attachment.isPending() && (t3.trixSerialize = false), t3;
  }
  getHref() {
    if (!pi(this.attachment.getContent(), "a")) return this.attachment.getHref();
  }
  getCaptionConfig() {
    var t3;
    const e2 = this.attachment.getType(), n2 = kt(null === (t3 = i[e2]) || void 0 === t3 ? void 0 : t3.caption);
    return "file" === e2 && (n2.name = true), n2;
  }
  findProgressElement() {
    var t3;
    return null === (t3 = this.findElement()) || void 0 === t3 ? void 0 : t3.querySelector("progress");
  }
  attachmentDidChangeUploadProgress() {
    const t3 = this.attachment.getUploadProgress(), e2 = this.findProgressElement();
    e2 && (e2.value = t3);
  }
};
var mi = (t3) => T({ tagName: "span", textContent: d, data: { trixCursorTarget: t3, trixSerialize: false } });
var pi = function(t3, e2) {
  const i2 = T("div");
  return ui.setHTML(i2, t3 || ""), i2.querySelector(e2);
};
var fi = class extends gi {
  constructor() {
    super(...arguments), this.attachment.previewDelegate = this;
  }
  createContentNodes() {
    return this.image = T({ tagName: "img", attributes: { src: "" }, data: { trixMutable: true } }), this.refresh(this.image), [this.image];
  }
  createCaptionElement() {
    const t3 = super.createCaptionElement(...arguments);
    return t3.textContent || t3.setAttribute("data-trix-placeholder", c.captionPlaceholder), t3;
  }
  refresh(t3) {
    var e2;
    t3 || (t3 = null === (e2 = this.findElement()) || void 0 === e2 ? void 0 : e2.querySelector("img"));
    if (t3) return this.updateAttributesForImage(t3);
  }
  updateAttributesForImage(t3) {
    const e2 = this.attachment.getURL(), i2 = this.attachment.getPreviewURL();
    if (t3.src = i2 || e2, i2 === e2) t3.removeAttribute("data-trix-serialized-attributes");
    else {
      const i3 = JSON.stringify({ src: e2 });
      t3.setAttribute("data-trix-serialized-attributes", i3);
    }
    const n2 = this.attachment.getWidth(), r2 = this.attachment.getHeight();
    null != n2 && (t3.width = n2), null != r2 && (t3.height = r2);
    const o2 = ["imageElement", this.attachment.id, t3.src, t3.width, t3.height].join("/");
    t3.dataset.trixStoreKey = o2;
  }
  attachmentDidChangeAttributes() {
    return this.refresh(this.image), this.refresh();
  }
};
var bi = class extends ie {
  constructor() {
    super(...arguments), this.piece = this.object, this.attributes = this.piece.getAttributes(), this.textConfig = this.options.textConfig, this.context = this.options.context, this.piece.attachment ? this.attachment = this.piece.attachment : this.string = this.piece.toString();
  }
  createNodes() {
    let t3 = this.attachment ? this.createAttachmentNodes() : this.createStringNodes();
    const e2 = this.createElement();
    if (e2) {
      const i2 = function(t4) {
        for (; null !== (e3 = t4) && void 0 !== e3 && e3.firstElementChild; ) {
          var e3;
          t4 = t4.firstElementChild;
        }
        return t4;
      }(e2);
      Array.from(t3).forEach((t4) => {
        i2.appendChild(t4);
      }), t3 = [e2];
    }
    return t3;
  }
  createAttachmentNodes() {
    const t3 = this.attachment.isPreviewable() ? fi : gi;
    return this.createChildView(t3, this.piece.attachment, { piece: this.piece }).getNodes();
  }
  createStringNodes() {
    var t3;
    if (null !== (t3 = this.textConfig) && void 0 !== t3 && t3.plaintext) return [document.createTextNode(this.string)];
    {
      const t4 = [], e2 = this.string.split("\n");
      for (let i2 = 0; i2 < e2.length; i2++) {
        const n2 = e2[i2];
        if (i2 > 0) {
          const e3 = T("br");
          t4.push(e3);
        }
        if (n2.length) {
          const e3 = document.createTextNode(this.preserveSpaces(n2));
          t4.push(e3);
        }
      }
      return t4;
    }
  }
  createElement() {
    let t3, e2, i2;
    const n2 = {};
    for (e2 in this.attributes) {
      i2 = this.attributes[e2];
      const o2 = ft(e2);
      if (o2) {
        if (o2.tagName) {
          var r2;
          const e3 = T(o2.tagName);
          r2 ? (r2.appendChild(e3), r2 = e3) : t3 = r2 = e3;
        }
        if (o2.styleProperty && (n2[o2.styleProperty] = i2), o2.style) for (e2 in o2.style) i2 = o2.style[e2], n2[e2] = i2;
      }
    }
    if (Object.keys(n2).length) for (e2 in t3 || (t3 = T("span")), n2) i2 = n2[e2], t3.style[e2] = i2;
    return t3;
  }
  createContainerElement() {
    for (const t3 in this.attributes) {
      const e2 = this.attributes[t3], i2 = ft(t3);
      if (i2 && i2.groupTagName) {
        const n2 = {};
        return n2[t3] = e2, T(i2.groupTagName, n2);
      }
    }
  }
  preserveSpaces(t3) {
    return this.context.isLast && (t3 = t3.replace(/\ $/, g)), t3 = t3.replace(/(\S)\ {3}(\S)/g, "$1 ".concat(g, " $2")).replace(/\ {2}/g, "".concat(g, " ")).replace(/\ {2}/g, " ".concat(g)), (this.context.isFirst || this.context.followsWhitespace) && (t3 = t3.replace(/^\ /, g)), t3;
  }
};
var vi = class extends ie {
  constructor() {
    super(...arguments), this.text = this.object, this.textConfig = this.options.textConfig;
  }
  createNodes() {
    const t3 = [], e2 = Xt.groupObjects(this.getPieces()), i2 = e2.length - 1;
    for (let r2 = 0; r2 < e2.length; r2++) {
      const o2 = e2[r2], s2 = {};
      0 === r2 && (s2.isFirst = true), r2 === i2 && (s2.isLast = true), Ai(n2) && (s2.followsWhitespace = true);
      const a2 = this.findOrCreateCachedChildView(bi, o2, { textConfig: this.textConfig, context: s2 });
      t3.push(...Array.from(a2.getNodes() || []));
      var n2 = o2;
    }
    return t3;
  }
  getPieces() {
    return Array.from(this.text.getPieces()).filter((t3) => !t3.hasAttribute("blockBreak"));
  }
};
var Ai = (t3) => /\s$/.test(null == t3 ? void 0 : t3.toString());
var { css: yi } = z;
var xi = class extends ie {
  constructor() {
    super(...arguments), this.block = this.object, this.attributes = this.block.getAttributes();
  }
  createNodes() {
    const t3 = [document.createComment("block")];
    if (this.block.isEmpty()) t3.push(T("br"));
    else {
      var e2;
      const i2 = null === (e2 = mt(this.block.getLastAttribute())) || void 0 === e2 ? void 0 : e2.text, n2 = this.findOrCreateCachedChildView(vi, this.block.text, { textConfig: i2 });
      t3.push(...Array.from(n2.getNodes() || [])), this.shouldAddExtraNewlineElement() && t3.push(T("br"));
    }
    if (this.attributes.length) return t3;
    {
      let e3;
      const { tagName: i2 } = n.default;
      this.block.isRTL() && (e3 = { dir: "rtl" });
      const r2 = T({ tagName: i2, attributes: e3 });
      return t3.forEach((t4) => r2.appendChild(t4)), [r2];
    }
  }
  createContainerElement(t3) {
    const e2 = {};
    let i2;
    const n2 = this.attributes[t3], { tagName: r2, htmlAttributes: o2 = [] } = mt(n2);
    if (0 === t3 && this.block.isRTL() && Object.assign(e2, { dir: "rtl" }), "attachmentGallery" === n2) {
      const t4 = this.block.getBlockBreakPosition();
      i2 = "".concat(yi.attachmentGallery, " ").concat(yi.attachmentGallery, "--").concat(t4);
    }
    return Object.entries(this.block.htmlAttributes).forEach((t4) => {
      let [i3, n3] = t4;
      o2.includes(i3) && (e2[i3] = n3);
    }), T({ tagName: r2, className: i2, attributes: e2 });
  }
  shouldAddExtraNewlineElement() {
    return /\n\n$/.test(this.block.toString());
  }
};
var Ci = class extends ie {
  static render(t3) {
    const e2 = T("div"), i2 = new this(t3, { element: e2 });
    return i2.render(), i2.sync(), e2;
  }
  constructor() {
    super(...arguments), this.element = this.options.element, this.elementStore = new Qt(), this.setDocument(this.object);
  }
  setDocument(t3) {
    t3.isEqualTo(this.document) || (this.document = this.object = t3);
  }
  render() {
    if (this.childViews = [], this.shadowElement = T("div"), !this.document.isEmpty()) {
      const t3 = Xt.groupObjects(this.document.getBlocks(), { asTree: true });
      Array.from(t3).forEach((t4) => {
        const e2 = this.findOrCreateCachedChildView(xi, t4);
        Array.from(e2.getNodes()).map((t5) => this.shadowElement.appendChild(t5));
      });
    }
  }
  isSynced() {
    return Si(this.shadowElement, this.element);
  }
  sync() {
    const t3 = this.createDocumentFragmentForSync();
    for (; this.element.lastChild; ) this.element.removeChild(this.element.lastChild);
    return this.element.appendChild(t3), this.didSync();
  }
  didSync() {
    return this.elementStore.reset(Ei(this.element)), Rt(() => this.garbageCollectCachedViews());
  }
  createDocumentFragmentForSync() {
    const t3 = document.createDocumentFragment();
    return Array.from(this.shadowElement.childNodes).forEach((e2) => {
      t3.appendChild(e2.cloneNode(true));
    }), Array.from(Ei(t3)).forEach((t4) => {
      const e2 = this.elementStore.remove(t4);
      e2 && t4.parentNode.replaceChild(e2, t4);
    }), t3;
  }
};
var Ei = (t3) => t3.querySelectorAll("[data-trix-store-key]");
var Si = (t3, e2) => Ri(t3.innerHTML) === Ri(e2.innerHTML);
var Ri = (t3) => t3.replace(/&nbsp;/g, " ");
function ki(t3) {
  var e2, i2;
  function n2(e3, i3) {
    try {
      var o2 = t3[e3](i3), s2 = o2.value, a2 = s2 instanceof Ti;
      Promise.resolve(a2 ? s2.v : s2).then(function(i4) {
        if (a2) {
          var l2 = "return" === e3 ? "return" : "next";
          if (!s2.k || i4.done) return n2(l2, i4);
          i4 = t3[l2](i4).value;
        }
        r2(o2.done ? "return" : "normal", i4);
      }, function(t4) {
        n2("throw", t4);
      });
    } catch (t4) {
      r2("throw", t4);
    }
  }
  function r2(t4, r3) {
    switch (t4) {
      case "return":
        e2.resolve({ value: r3, done: true });
        break;
      case "throw":
        e2.reject(r3);
        break;
      default:
        e2.resolve({ value: r3, done: false });
    }
    (e2 = e2.next) ? n2(e2.key, e2.arg) : i2 = null;
  }
  this._invoke = function(t4, r3) {
    return new Promise(function(o2, s2) {
      var a2 = { key: t4, arg: r3, resolve: o2, reject: s2, next: null };
      i2 ? i2 = i2.next = a2 : (e2 = i2 = a2, n2(t4, r3));
    });
  }, "function" != typeof t3.return && (this.return = void 0);
}
function Ti(t3, e2) {
  this.v = t3, this.k = e2;
}
function wi(t3, e2, i2) {
  return (e2 = Li(e2)) in t3 ? Object.defineProperty(t3, e2, { value: i2, enumerable: true, configurable: true, writable: true }) : t3[e2] = i2, t3;
}
function Li(t3) {
  var e2 = function(t4, e3) {
    if ("object" != typeof t4 || null === t4) return t4;
    var i2 = t4[Symbol.toPrimitive];
    if (void 0 !== i2) {
      var n2 = i2.call(t4, e3 || "default");
      if ("object" != typeof n2) return n2;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return ("string" === e3 ? String : Number)(t4);
  }(t3, "string");
  return "symbol" == typeof e2 ? e2 : String(e2);
}
ki.prototype["function" == typeof Symbol && Symbol.asyncIterator || "@@asyncIterator"] = function() {
  return this;
}, ki.prototype.next = function(t3) {
  return this._invoke("next", t3);
}, ki.prototype.throw = function(t3) {
  return this._invoke("throw", t3);
}, ki.prototype.return = function(t3) {
  return this._invoke("return", t3);
};
function Di(t3, e2) {
  return Oi(t3, Ii(t3, e2, "get"));
}
function Ni(t3, e2, i2) {
  return Fi(t3, Ii(t3, e2, "set"), i2), i2;
}
function Ii(t3, e2, i2) {
  if (!e2.has(t3)) throw new TypeError("attempted to " + i2 + " private field on non-instance");
  return e2.get(t3);
}
function Oi(t3, e2) {
  return e2.get ? e2.get.call(t3) : e2.value;
}
function Fi(t3, e2, i2) {
  if (e2.set) e2.set.call(t3, i2);
  else {
    if (!e2.writable) throw new TypeError("attempted to set read only private field");
    e2.value = i2;
  }
}
function Pi(t3, e2, i2) {
  if (!e2.has(t3)) throw new TypeError("attempted to get private field on non-instance");
  return i2;
}
function Mi(t3, e2) {
  if (e2.has(t3)) throw new TypeError("Cannot initialize the same private elements twice on an object");
}
function Bi(t3, e2, i2) {
  Mi(t3, e2), e2.set(t3, i2);
}
var _i = class extends rt {
  static registerType(t3, e2) {
    e2.type = t3, this.types[t3] = e2;
  }
  static fromJSON(t3) {
    const e2 = this.types[t3.type];
    if (e2) return e2.fromJSON(t3);
  }
  constructor(t3) {
    let e2 = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {};
    super(...arguments), this.attributes = Ht.box(e2);
  }
  copyWithAttributes(t3) {
    return new this.constructor(this.getValue(), t3);
  }
  copyWithAdditionalAttributes(t3) {
    return this.copyWithAttributes(this.attributes.merge(t3));
  }
  copyWithoutAttribute(t3) {
    return this.copyWithAttributes(this.attributes.remove(t3));
  }
  copy() {
    return this.copyWithAttributes(this.attributes);
  }
  getAttribute(t3) {
    return this.attributes.get(t3);
  }
  getAttributesHash() {
    return this.attributes;
  }
  getAttributes() {
    return this.attributes.toObject();
  }
  hasAttribute(t3) {
    return this.attributes.has(t3);
  }
  hasSameStringValueAsPiece(t3) {
    return t3 && this.toString() === t3.toString();
  }
  hasSameAttributesAsPiece(t3) {
    return t3 && (this.attributes === t3.attributes || this.attributes.isEqualTo(t3.attributes));
  }
  isBlockBreak() {
    return false;
  }
  isEqualTo(t3) {
    return super.isEqualTo(...arguments) || this.hasSameConstructorAs(t3) && this.hasSameStringValueAsPiece(t3) && this.hasSameAttributesAsPiece(t3);
  }
  isEmpty() {
    return 0 === this.length;
  }
  isSerializable() {
    return true;
  }
  toJSON() {
    return { type: this.constructor.type, attributes: this.getAttributes() };
  }
  contentsForInspection() {
    return { type: this.constructor.type, attributes: this.attributes.inspect() };
  }
  canBeGrouped() {
    return this.hasAttribute("href");
  }
  canBeGroupedWith(t3) {
    return this.getAttribute("href") === t3.getAttribute("href");
  }
  getLength() {
    return this.length;
  }
  canBeConsolidatedWith(t3) {
    return false;
  }
};
wi(_i, "types", {});
var ji = class extends ee {
  constructor(t3) {
    super(...arguments), this.url = t3;
  }
  perform(t3) {
    const e2 = new Image();
    e2.onload = () => (e2.width = this.width = e2.naturalWidth, e2.height = this.height = e2.naturalHeight, t3(true, e2)), e2.onerror = () => t3(false), e2.src = this.url;
  }
};
var Wi = class _Wi extends rt {
  static attachmentForFile(t3) {
    const e2 = new this(this.attributesForFile(t3));
    return e2.setFile(t3), e2;
  }
  static attributesForFile(t3) {
    return new Ht({ filename: t3.name, filesize: t3.size, contentType: t3.type });
  }
  static fromJSON(t3) {
    return new this(t3);
  }
  constructor() {
    let t3 = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {};
    super(t3), this.releaseFile = this.releaseFile.bind(this), this.attributes = Ht.box(t3), this.didChangeAttributes();
  }
  getAttribute(t3) {
    return this.attributes.get(t3);
  }
  hasAttribute(t3) {
    return this.attributes.has(t3);
  }
  getAttributes() {
    return this.attributes.toObject();
  }
  setAttributes() {
    let t3 = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {};
    const e2 = this.attributes.merge(t3);
    var i2, n2, r2, o2;
    if (!this.attributes.isEqualTo(e2)) return this.attributes = e2, this.didChangeAttributes(), null === (i2 = this.previewDelegate) || void 0 === i2 || null === (n2 = i2.attachmentDidChangeAttributes) || void 0 === n2 || n2.call(i2, this), null === (r2 = this.delegate) || void 0 === r2 || null === (o2 = r2.attachmentDidChangeAttributes) || void 0 === o2 ? void 0 : o2.call(r2, this);
  }
  didChangeAttributes() {
    if (this.isPreviewable()) return this.preloadURL();
  }
  isPending() {
    return null != this.file && !(this.getURL() || this.getHref());
  }
  isPreviewable() {
    return this.attributes.has("previewable") ? this.attributes.get("previewable") : _Wi.previewablePattern.test(this.getContentType());
  }
  getType() {
    return this.hasContent() ? "content" : this.isPreviewable() ? "preview" : "file";
  }
  getURL() {
    return this.attributes.get("url");
  }
  getHref() {
    return this.attributes.get("href");
  }
  getFilename() {
    return this.attributes.get("filename") || "";
  }
  getFilesize() {
    return this.attributes.get("filesize");
  }
  getFormattedFilesize() {
    const t3 = this.attributes.get("filesize");
    return "number" == typeof t3 ? h.formatter(t3) : "";
  }
  getExtension() {
    var t3;
    return null === (t3 = this.getFilename().match(/\.(\w+)$/)) || void 0 === t3 ? void 0 : t3[1].toLowerCase();
  }
  getContentType() {
    return this.attributes.get("contentType");
  }
  hasContent() {
    return this.attributes.has("content");
  }
  getContent() {
    return this.attributes.get("content");
  }
  getWidth() {
    return this.attributes.get("width");
  }
  getHeight() {
    return this.attributes.get("height");
  }
  getFile() {
    return this.file;
  }
  setFile(t3) {
    if (this.file = t3, this.isPreviewable()) return this.preloadFile();
  }
  releaseFile() {
    this.releasePreloadedFile(), this.file = null;
  }
  getUploadProgress() {
    return null != this.uploadProgress ? this.uploadProgress : 0;
  }
  setUploadProgress(t3) {
    var e2, i2;
    if (this.uploadProgress !== t3) return this.uploadProgress = t3, null === (e2 = this.uploadProgressDelegate) || void 0 === e2 || null === (i2 = e2.attachmentDidChangeUploadProgress) || void 0 === i2 ? void 0 : i2.call(e2, this);
  }
  toJSON() {
    return this.getAttributes();
  }
  getCacheKey() {
    return [super.getCacheKey(...arguments), this.attributes.getCacheKey(), this.getPreviewURL()].join("/");
  }
  getPreviewURL() {
    return this.previewURL || this.preloadingURL;
  }
  setPreviewURL(t3) {
    var e2, i2, n2, r2;
    if (t3 !== this.getPreviewURL()) return this.previewURL = t3, null === (e2 = this.previewDelegate) || void 0 === e2 || null === (i2 = e2.attachmentDidChangeAttributes) || void 0 === i2 || i2.call(e2, this), null === (n2 = this.delegate) || void 0 === n2 || null === (r2 = n2.attachmentDidChangePreviewURL) || void 0 === r2 ? void 0 : r2.call(n2, this);
  }
  preloadURL() {
    return this.preload(this.getURL(), this.releaseFile);
  }
  preloadFile() {
    if (this.file) return this.fileObjectURL = URL.createObjectURL(this.file), this.preload(this.fileObjectURL);
  }
  releasePreloadedFile() {
    this.fileObjectURL && (URL.revokeObjectURL(this.fileObjectURL), this.fileObjectURL = null);
  }
  preload(t3, e2) {
    if (t3 && t3 !== this.getPreviewURL()) {
      this.preloadingURL = t3;
      return new ji(t3).then((i2) => {
        let { width: n2, height: r2 } = i2;
        return this.getWidth() && this.getHeight() || this.setAttributes({ width: n2, height: r2 }), this.preloadingURL = null, this.setPreviewURL(t3), null == e2 ? void 0 : e2();
      }).catch(() => (this.preloadingURL = null, null == e2 ? void 0 : e2()));
    }
  }
};
wi(Wi, "previewablePattern", /^image(\/(gif|png|webp|jpe?g)|$)/);
var Ui = class _Ui extends _i {
  static fromJSON(t3) {
    return new this(Wi.fromJSON(t3.attachment), t3.attributes);
  }
  constructor(t3) {
    super(...arguments), this.attachment = t3, this.length = 1, this.ensureAttachmentExclusivelyHasAttribute("href"), this.attachment.hasContent() || this.removeProhibitedAttributes();
  }
  ensureAttachmentExclusivelyHasAttribute(t3) {
    this.hasAttribute(t3) && (this.attachment.hasAttribute(t3) || this.attachment.setAttributes(this.attributes.slice([t3])), this.attributes = this.attributes.remove(t3));
  }
  removeProhibitedAttributes() {
    const t3 = this.attributes.slice(_Ui.permittedAttributes);
    t3.isEqualTo(this.attributes) || (this.attributes = t3);
  }
  getValue() {
    return this.attachment;
  }
  isSerializable() {
    return !this.attachment.isPending();
  }
  getCaption() {
    return this.attributes.get("caption") || "";
  }
  isEqualTo(t3) {
    var e2;
    return super.isEqualTo(t3) && this.attachment.id === (null == t3 || null === (e2 = t3.attachment) || void 0 === e2 ? void 0 : e2.id);
  }
  toString() {
    return "\uFFFC";
  }
  toJSON() {
    const t3 = super.toJSON(...arguments);
    return t3.attachment = this.attachment, t3;
  }
  getCacheKey() {
    return [super.getCacheKey(...arguments), this.attachment.getCacheKey()].join("/");
  }
  toConsole() {
    return JSON.stringify(this.toString());
  }
};
wi(Ui, "permittedAttributes", ["caption", "presentation"]), _i.registerType("attachment", Ui);
var Vi = class extends _i {
  static fromJSON(t3) {
    return new this(t3.string, t3.attributes);
  }
  constructor(t3) {
    super(...arguments), this.string = ((t4) => t4.replace(/\r\n?/g, "\n"))(t3), this.length = this.string.length;
  }
  getValue() {
    return this.string;
  }
  toString() {
    return this.string.toString();
  }
  isBlockBreak() {
    return "\n" === this.toString() && true === this.getAttribute("blockBreak");
  }
  toJSON() {
    const t3 = super.toJSON(...arguments);
    return t3.string = this.string, t3;
  }
  canBeConsolidatedWith(t3) {
    return t3 && this.hasSameConstructorAs(t3) && this.hasSameAttributesAsPiece(t3);
  }
  consolidateWith(t3) {
    return new this.constructor(this.toString() + t3.toString(), this.attributes);
  }
  splitAtOffset(t3) {
    let e2, i2;
    return 0 === t3 ? (e2 = null, i2 = this) : t3 === this.length ? (e2 = this, i2 = null) : (e2 = new this.constructor(this.string.slice(0, t3), this.attributes), i2 = new this.constructor(this.string.slice(t3), this.attributes)), [e2, i2];
  }
  toConsole() {
    let { string: t3 } = this;
    return t3.length > 15 && (t3 = t3.slice(0, 14) + "\u2026"), JSON.stringify(t3.toString());
  }
};
_i.registerType("string", Vi);
var zi = class extends rt {
  static box(t3) {
    return t3 instanceof this ? t3 : new this(t3);
  }
  constructor() {
    let t3 = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : [];
    super(...arguments), this.objects = t3.slice(0), this.length = this.objects.length;
  }
  indexOf(t3) {
    return this.objects.indexOf(t3);
  }
  splice() {
    for (var t3 = arguments.length, e2 = new Array(t3), i2 = 0; i2 < t3; i2++) e2[i2] = arguments[i2];
    return new this.constructor(st(this.objects, ...e2));
  }
  eachObject(t3) {
    return this.objects.map((e2, i2) => t3(e2, i2));
  }
  insertObjectAtIndex(t3, e2) {
    return this.splice(e2, 0, t3);
  }
  insertSplittableListAtIndex(t3, e2) {
    return this.splice(e2, 0, ...t3.objects);
  }
  insertSplittableListAtPosition(t3, e2) {
    const [i2, n2] = this.splitObjectAtPosition(e2);
    return new this.constructor(i2).insertSplittableListAtIndex(t3, n2);
  }
  editObjectAtIndex(t3, e2) {
    return this.replaceObjectAtIndex(e2(this.objects[t3]), t3);
  }
  replaceObjectAtIndex(t3, e2) {
    return this.splice(e2, 1, t3);
  }
  removeObjectAtIndex(t3) {
    return this.splice(t3, 1);
  }
  getObjectAtIndex(t3) {
    return this.objects[t3];
  }
  getSplittableListInRange(t3) {
    const [e2, i2, n2] = this.splitObjectsAtRange(t3);
    return new this.constructor(e2.slice(i2, n2 + 1));
  }
  selectSplittableList(t3) {
    const e2 = this.objects.filter((e3) => t3(e3));
    return new this.constructor(e2);
  }
  removeObjectsInRange(t3) {
    const [e2, i2, n2] = this.splitObjectsAtRange(t3);
    return new this.constructor(e2).splice(i2, n2 - i2 + 1);
  }
  transformObjectsInRange(t3, e2) {
    const [i2, n2, r2] = this.splitObjectsAtRange(t3), o2 = i2.map((t4, i3) => n2 <= i3 && i3 <= r2 ? e2(t4) : t4);
    return new this.constructor(o2);
  }
  splitObjectsAtRange(t3) {
    let e2, [i2, n2, r2] = this.splitObjectAtPosition(Hi(t3));
    return [i2, e2] = new this.constructor(i2).splitObjectAtPosition(Ji(t3) + r2), [i2, n2, e2 - 1];
  }
  getObjectAtPosition(t3) {
    const { index: e2 } = this.findIndexAndOffsetAtPosition(t3);
    return this.objects[e2];
  }
  splitObjectAtPosition(t3) {
    let e2, i2;
    const { index: n2, offset: r2 } = this.findIndexAndOffsetAtPosition(t3), o2 = this.objects.slice(0);
    if (null != n2) if (0 === r2) e2 = n2, i2 = 0;
    else {
      const t4 = this.getObjectAtIndex(n2), [s2, a2] = t4.splitAtOffset(r2);
      o2.splice(n2, 1, s2, a2), e2 = n2 + 1, i2 = s2.getLength() - r2;
    }
    else e2 = o2.length, i2 = 0;
    return [o2, e2, i2];
  }
  consolidate() {
    const t3 = [];
    let e2 = this.objects[0];
    return this.objects.slice(1).forEach((i2) => {
      var n2, r2;
      null !== (n2 = (r2 = e2).canBeConsolidatedWith) && void 0 !== n2 && n2.call(r2, i2) ? e2 = e2.consolidateWith(i2) : (t3.push(e2), e2 = i2);
    }), e2 && t3.push(e2), new this.constructor(t3);
  }
  consolidateFromIndexToIndex(t3, e2) {
    const i2 = this.objects.slice(0).slice(t3, e2 + 1), n2 = new this.constructor(i2).consolidate().toArray();
    return this.splice(t3, i2.length, ...n2);
  }
  findIndexAndOffsetAtPosition(t3) {
    let e2, i2 = 0;
    for (e2 = 0; e2 < this.objects.length; e2++) {
      const n2 = i2 + this.objects[e2].getLength();
      if (i2 <= t3 && t3 < n2) return { index: e2, offset: t3 - i2 };
      i2 = n2;
    }
    return { index: null, offset: null };
  }
  findPositionAtIndexAndOffset(t3, e2) {
    let i2 = 0;
    for (let n2 = 0; n2 < this.objects.length; n2++) {
      const r2 = this.objects[n2];
      if (n2 < t3) i2 += r2.getLength();
      else if (n2 === t3) {
        i2 += e2;
        break;
      }
    }
    return i2;
  }
  getEndPosition() {
    return null == this.endPosition && (this.endPosition = 0, this.objects.forEach((t3) => this.endPosition += t3.getLength())), this.endPosition;
  }
  toString() {
    return this.objects.join("");
  }
  toArray() {
    return this.objects.slice(0);
  }
  toJSON() {
    return this.toArray();
  }
  isEqualTo(t3) {
    return super.isEqualTo(...arguments) || qi(this.objects, null == t3 ? void 0 : t3.objects);
  }
  contentsForInspection() {
    return { objects: "[".concat(this.objects.map((t3) => t3.inspect()).join(", "), "]") };
  }
};
var qi = function(t3) {
  let e2 = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : [];
  if (t3.length !== e2.length) return false;
  let i2 = true;
  for (let n2 = 0; n2 < t3.length; n2++) {
    const r2 = t3[n2];
    i2 && !r2.isEqualTo(e2[n2]) && (i2 = false);
  }
  return i2;
};
var Hi = (t3) => t3[0];
var Ji = (t3) => t3[1];
var Ki = class extends rt {
  static textForAttachmentWithAttributes(t3, e2) {
    return new this([new Ui(t3, e2)]);
  }
  static textForStringWithAttributes(t3, e2) {
    return new this([new Vi(t3, e2)]);
  }
  static fromJSON(t3) {
    return new this(Array.from(t3).map((t4) => _i.fromJSON(t4)));
  }
  constructor() {
    let t3 = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : [];
    super(...arguments);
    const e2 = t3.filter((t4) => !t4.isEmpty());
    this.pieceList = new zi(e2);
  }
  copy() {
    return this.copyWithPieceList(this.pieceList);
  }
  copyWithPieceList(t3) {
    return new this.constructor(t3.consolidate().toArray());
  }
  copyUsingObjectMap(t3) {
    const e2 = this.getPieces().map((e3) => t3.find(e3) || e3);
    return new this.constructor(e2);
  }
  appendText(t3) {
    return this.insertTextAtPosition(t3, this.getLength());
  }
  insertTextAtPosition(t3, e2) {
    return this.copyWithPieceList(this.pieceList.insertSplittableListAtPosition(t3.pieceList, e2));
  }
  removeTextAtRange(t3) {
    return this.copyWithPieceList(this.pieceList.removeObjectsInRange(t3));
  }
  replaceTextAtRange(t3, e2) {
    return this.removeTextAtRange(e2).insertTextAtPosition(t3, e2[0]);
  }
  moveTextFromRangeToPosition(t3, e2) {
    if (t3[0] <= e2 && e2 <= t3[1]) return;
    const i2 = this.getTextAtRange(t3), n2 = i2.getLength();
    return t3[0] < e2 && (e2 -= n2), this.removeTextAtRange(t3).insertTextAtPosition(i2, e2);
  }
  addAttributeAtRange(t3, e2, i2) {
    const n2 = {};
    return n2[t3] = e2, this.addAttributesAtRange(n2, i2);
  }
  addAttributesAtRange(t3, e2) {
    return this.copyWithPieceList(this.pieceList.transformObjectsInRange(e2, (e3) => e3.copyWithAdditionalAttributes(t3)));
  }
  removeAttributeAtRange(t3, e2) {
    return this.copyWithPieceList(this.pieceList.transformObjectsInRange(e2, (e3) => e3.copyWithoutAttribute(t3)));
  }
  setAttributesAtRange(t3, e2) {
    return this.copyWithPieceList(this.pieceList.transformObjectsInRange(e2, (e3) => e3.copyWithAttributes(t3)));
  }
  getAttributesAtPosition(t3) {
    var e2;
    return (null === (e2 = this.pieceList.getObjectAtPosition(t3)) || void 0 === e2 ? void 0 : e2.getAttributes()) || {};
  }
  getCommonAttributes() {
    const t3 = Array.from(this.pieceList.toArray()).map((t4) => t4.getAttributes());
    return Ht.fromCommonAttributesOfObjects(t3).toObject();
  }
  getCommonAttributesAtRange(t3) {
    return this.getTextAtRange(t3).getCommonAttributes() || {};
  }
  getExpandedRangeForAttributeAtOffset(t3, e2) {
    let i2, n2 = i2 = e2;
    const r2 = this.getLength();
    for (; n2 > 0 && this.getCommonAttributesAtRange([n2 - 1, i2])[t3]; ) n2--;
    for (; i2 < r2 && this.getCommonAttributesAtRange([e2, i2 + 1])[t3]; ) i2++;
    return [n2, i2];
  }
  getTextAtRange(t3) {
    return this.copyWithPieceList(this.pieceList.getSplittableListInRange(t3));
  }
  getStringAtRange(t3) {
    return this.pieceList.getSplittableListInRange(t3).toString();
  }
  getStringAtPosition(t3) {
    return this.getStringAtRange([t3, t3 + 1]);
  }
  startsWithString(t3) {
    return this.getStringAtRange([0, t3.length]) === t3;
  }
  endsWithString(t3) {
    const e2 = this.getLength();
    return this.getStringAtRange([e2 - t3.length, e2]) === t3;
  }
  getAttachmentPieces() {
    return this.pieceList.toArray().filter((t3) => !!t3.attachment);
  }
  getAttachments() {
    return this.getAttachmentPieces().map((t3) => t3.attachment);
  }
  getAttachmentAndPositionById(t3) {
    let e2 = 0;
    for (const n2 of this.pieceList.toArray()) {
      var i2;
      if ((null === (i2 = n2.attachment) || void 0 === i2 ? void 0 : i2.id) === t3) return { attachment: n2.attachment, position: e2 };
      e2 += n2.length;
    }
    return { attachment: null, position: null };
  }
  getAttachmentById(t3) {
    const { attachment: e2 } = this.getAttachmentAndPositionById(t3);
    return e2;
  }
  getRangeOfAttachment(t3) {
    const e2 = this.getAttachmentAndPositionById(t3.id), i2 = e2.position;
    if (t3 = e2.attachment) return [i2, i2 + 1];
  }
  updateAttributesForAttachment(t3, e2) {
    const i2 = this.getRangeOfAttachment(e2);
    return i2 ? this.addAttributesAtRange(t3, i2) : this;
  }
  getLength() {
    return this.pieceList.getEndPosition();
  }
  isEmpty() {
    return 0 === this.getLength();
  }
  isEqualTo(t3) {
    var e2;
    return super.isEqualTo(t3) || (null == t3 || null === (e2 = t3.pieceList) || void 0 === e2 ? void 0 : e2.isEqualTo(this.pieceList));
  }
  isBlockBreak() {
    return 1 === this.getLength() && this.pieceList.getObjectAtIndex(0).isBlockBreak();
  }
  eachPiece(t3) {
    return this.pieceList.eachObject(t3);
  }
  getPieces() {
    return this.pieceList.toArray();
  }
  getPieceAtPosition(t3) {
    return this.pieceList.getObjectAtPosition(t3);
  }
  contentsForInspection() {
    return { pieceList: this.pieceList.inspect() };
  }
  toSerializableText() {
    const t3 = this.pieceList.selectSplittableList((t4) => t4.isSerializable());
    return this.copyWithPieceList(t3);
  }
  toString() {
    return this.pieceList.toString();
  }
  toJSON() {
    return this.pieceList.toJSON();
  }
  toConsole() {
    return JSON.stringify(this.pieceList.toArray().map((t3) => JSON.parse(t3.toConsole())));
  }
  getDirection() {
    return lt(this.toString());
  }
  isRTL() {
    return "rtl" === this.getDirection();
  }
};
var Gi = class _Gi extends rt {
  static fromJSON(t3) {
    return new this(Ki.fromJSON(t3.text), t3.attributes, t3.htmlAttributes);
  }
  constructor(t3, e2, i2) {
    super(...arguments), this.text = Yi(t3 || new Ki()), this.attributes = e2 || [], this.htmlAttributes = i2 || {};
  }
  isEmpty() {
    return this.text.isBlockBreak();
  }
  isEqualTo(t3) {
    return !!super.isEqualTo(t3) || this.text.isEqualTo(null == t3 ? void 0 : t3.text) && ot(this.attributes, null == t3 ? void 0 : t3.attributes) && Tt(this.htmlAttributes, null == t3 ? void 0 : t3.htmlAttributes);
  }
  copyWithText(t3) {
    return new _Gi(t3, this.attributes, this.htmlAttributes);
  }
  copyWithoutText() {
    return this.copyWithText(null);
  }
  copyWithAttributes(t3) {
    return new _Gi(this.text, t3, this.htmlAttributes);
  }
  copyWithoutAttributes() {
    return this.copyWithAttributes(null);
  }
  copyUsingObjectMap(t3) {
    const e2 = t3.find(this.text);
    return e2 ? this.copyWithText(e2) : this.copyWithText(this.text.copyUsingObjectMap(t3));
  }
  addAttribute(t3) {
    const e2 = this.attributes.concat(en(t3));
    return this.copyWithAttributes(e2);
  }
  addHTMLAttribute(t3, e2) {
    const i2 = Object.assign({}, this.htmlAttributes, { [t3]: e2 });
    return new _Gi(this.text, this.attributes, i2);
  }
  removeAttribute(t3) {
    const { listAttribute: e2 } = mt(t3), i2 = rn(rn(this.attributes, t3), e2);
    return this.copyWithAttributes(i2);
  }
  removeLastAttribute() {
    return this.removeAttribute(this.getLastAttribute());
  }
  getLastAttribute() {
    return nn(this.attributes);
  }
  getAttributes() {
    return this.attributes.slice(0);
  }
  getAttributeLevel() {
    return this.attributes.length;
  }
  getAttributeAtLevel(t3) {
    return this.attributes[t3 - 1];
  }
  hasAttribute(t3) {
    return this.attributes.includes(t3);
  }
  hasAttributes() {
    return this.getAttributeLevel() > 0;
  }
  getLastNestableAttribute() {
    return nn(this.getNestableAttributes());
  }
  getNestableAttributes() {
    return this.attributes.filter((t3) => mt(t3).nestable);
  }
  getNestingLevel() {
    return this.getNestableAttributes().length;
  }
  decreaseNestingLevel() {
    const t3 = this.getLastNestableAttribute();
    return t3 ? this.removeAttribute(t3) : this;
  }
  increaseNestingLevel() {
    const t3 = this.getLastNestableAttribute();
    if (t3) {
      const e2 = this.attributes.lastIndexOf(t3), i2 = st(this.attributes, e2 + 1, 0, ...en(t3));
      return this.copyWithAttributes(i2);
    }
    return this;
  }
  getListItemAttributes() {
    return this.attributes.filter((t3) => mt(t3).listAttribute);
  }
  isListItem() {
    var t3;
    return null === (t3 = mt(this.getLastAttribute())) || void 0 === t3 ? void 0 : t3.listAttribute;
  }
  isTerminalBlock() {
    var t3;
    return null === (t3 = mt(this.getLastAttribute())) || void 0 === t3 ? void 0 : t3.terminal;
  }
  breaksOnReturn() {
    var t3;
    return null === (t3 = mt(this.getLastAttribute())) || void 0 === t3 ? void 0 : t3.breakOnReturn;
  }
  findLineBreakInDirectionFromPosition(t3, e2) {
    const i2 = this.toString();
    let n2;
    switch (t3) {
      case "forward":
        n2 = i2.indexOf("\n", e2);
        break;
      case "backward":
        n2 = i2.slice(0, e2).lastIndexOf("\n");
    }
    if (-1 !== n2) return n2;
  }
  contentsForInspection() {
    return { text: this.text.inspect(), attributes: this.attributes };
  }
  toString() {
    return this.text.toString();
  }
  toJSON() {
    return { text: this.text, attributes: this.attributes, htmlAttributes: this.htmlAttributes };
  }
  getDirection() {
    return this.text.getDirection();
  }
  isRTL() {
    return this.text.isRTL();
  }
  getLength() {
    return this.text.getLength();
  }
  canBeConsolidatedWith(t3) {
    return !this.hasAttributes() && !t3.hasAttributes() && this.getDirection() === t3.getDirection();
  }
  consolidateWith(t3) {
    const e2 = Ki.textForStringWithAttributes("\n"), i2 = this.getTextWithoutBlockBreak().appendText(e2);
    return this.copyWithText(i2.appendText(t3.text));
  }
  splitAtOffset(t3) {
    let e2, i2;
    return 0 === t3 ? (e2 = null, i2 = this) : t3 === this.getLength() ? (e2 = this, i2 = null) : (e2 = this.copyWithText(this.text.getTextAtRange([0, t3])), i2 = this.copyWithText(this.text.getTextAtRange([t3, this.getLength()]))), [e2, i2];
  }
  getBlockBreakPosition() {
    return this.text.getLength() - 1;
  }
  getTextWithoutBlockBreak() {
    return Qi(this.text) ? this.text.getTextAtRange([0, this.getBlockBreakPosition()]) : this.text.copy();
  }
  canBeGrouped(t3) {
    return this.attributes[t3];
  }
  canBeGroupedWith(t3, e2) {
    const i2 = t3.getAttributes(), r2 = i2[e2], o2 = this.attributes[e2];
    return o2 === r2 && !(false === mt(o2).group && !(() => {
      if (!dt) {
        dt = [];
        for (const t4 in n) {
          const { listAttribute: e3 } = n[t4];
          null != e3 && dt.push(e3);
        }
      }
      return dt;
    })().includes(i2[e2 + 1])) && (this.getDirection() === t3.getDirection() || t3.isEmpty());
  }
};
var Yi = function(t3) {
  return t3 = $i(t3), t3 = Zi(t3);
};
var $i = function(t3) {
  let e2 = false;
  const i2 = t3.getPieces();
  let n2 = i2.slice(0, i2.length - 1);
  const r2 = i2[i2.length - 1];
  return r2 ? (n2 = n2.map((t4) => t4.isBlockBreak() ? (e2 = true, tn(t4)) : t4), e2 ? new Ki([...n2, r2]) : t3) : t3;
};
var Xi = Ki.textForStringWithAttributes("\n", { blockBreak: true });
var Zi = function(t3) {
  return Qi(t3) ? t3 : t3.appendText(Xi);
};
var Qi = function(t3) {
  const e2 = t3.getLength();
  if (0 === e2) return false;
  return t3.getTextAtRange([e2 - 1, e2]).isBlockBreak();
};
var tn = (t3) => t3.copyWithoutAttribute("blockBreak");
var en = function(t3) {
  const { listAttribute: e2 } = mt(t3);
  return e2 ? [e2, t3] : [t3];
};
var nn = (t3) => t3.slice(-1)[0];
var rn = function(t3, e2) {
  const i2 = t3.lastIndexOf(e2);
  return -1 === i2 ? t3 : st(t3, i2, 1);
};
var on = class extends rt {
  static fromJSON(t3) {
    return new this(Array.from(t3).map((t4) => Gi.fromJSON(t4)));
  }
  static fromString(t3, e2) {
    const i2 = Ki.textForStringWithAttributes(t3, e2);
    return new this([new Gi(i2)]);
  }
  constructor() {
    let t3 = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : [];
    super(...arguments), 0 === t3.length && (t3 = [new Gi()]), this.blockList = zi.box(t3);
  }
  isEmpty() {
    const t3 = this.getBlockAtIndex(0);
    return 1 === this.blockList.length && t3.isEmpty() && !t3.hasAttributes();
  }
  copy() {
    const t3 = (arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {}).consolidateBlocks ? this.blockList.consolidate().toArray() : this.blockList.toArray();
    return new this.constructor(t3);
  }
  copyUsingObjectsFromDocument(t3) {
    const e2 = new Zt(t3.getObjects());
    return this.copyUsingObjectMap(e2);
  }
  copyUsingObjectMap(t3) {
    const e2 = this.getBlocks().map((e3) => t3.find(e3) || e3.copyUsingObjectMap(t3));
    return new this.constructor(e2);
  }
  copyWithBaseBlockAttributes() {
    let t3 = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : [];
    const e2 = this.getBlocks().map((e3) => {
      const i2 = t3.concat(e3.getAttributes());
      return e3.copyWithAttributes(i2);
    });
    return new this.constructor(e2);
  }
  replaceBlock(t3, e2) {
    const i2 = this.blockList.indexOf(t3);
    return -1 === i2 ? this : new this.constructor(this.blockList.replaceObjectAtIndex(e2, i2));
  }
  insertDocumentAtRange(t3, e2) {
    const { blockList: i2 } = t3;
    e2 = wt(e2);
    let [n2] = e2;
    const { index: r2, offset: o2 } = this.locationFromPosition(n2);
    let s2 = this;
    const a2 = this.getBlockAtPosition(n2);
    return Lt(e2) && a2.isEmpty() && !a2.hasAttributes() ? s2 = new this.constructor(s2.blockList.removeObjectAtIndex(r2)) : a2.getBlockBreakPosition() === o2 && n2++, s2 = s2.removeTextAtRange(e2), new this.constructor(s2.blockList.insertSplittableListAtPosition(i2, n2));
  }
  mergeDocumentAtRange(t3, e2) {
    let i2, n2;
    e2 = wt(e2);
    const [r2] = e2, o2 = this.locationFromPosition(r2), s2 = this.getBlockAtIndex(o2.index).getAttributes(), a2 = t3.getBaseBlockAttributes(), l2 = s2.slice(-a2.length);
    if (ot(a2, l2)) {
      const e3 = s2.slice(0, -a2.length);
      i2 = t3.copyWithBaseBlockAttributes(e3);
    } else i2 = t3.copy({ consolidateBlocks: true }).copyWithBaseBlockAttributes(s2);
    const c2 = i2.getBlockCount(), u2 = i2.getBlockAtIndex(0);
    if (ot(s2, u2.getAttributes())) {
      const t4 = u2.getTextWithoutBlockBreak();
      if (n2 = this.insertTextAtRange(t4, e2), c2 > 1) {
        i2 = new this.constructor(i2.getBlocks().slice(1));
        const e3 = r2 + t4.getLength();
        n2 = n2.insertDocumentAtRange(i2, e3);
      }
    } else n2 = this.insertDocumentAtRange(i2, e2);
    return n2;
  }
  insertTextAtRange(t3, e2) {
    e2 = wt(e2);
    const [i2] = e2, { index: n2, offset: r2 } = this.locationFromPosition(i2), o2 = this.removeTextAtRange(e2);
    return new this.constructor(o2.blockList.editObjectAtIndex(n2, (e3) => e3.copyWithText(e3.text.insertTextAtPosition(t3, r2))));
  }
  removeTextAtRange(t3) {
    let e2;
    t3 = wt(t3);
    const [i2, n2] = t3;
    if (Lt(t3)) return this;
    const [r2, o2] = Array.from(this.locationRangeFromRange(t3)), s2 = r2.index, a2 = r2.offset, l2 = this.getBlockAtIndex(s2), c2 = o2.index, u2 = o2.offset, h2 = this.getBlockAtIndex(c2);
    if (n2 - i2 == 1 && l2.getBlockBreakPosition() === a2 && h2.getBlockBreakPosition() !== u2 && "\n" === h2.text.getStringAtPosition(u2)) e2 = this.blockList.editObjectAtIndex(c2, (t4) => t4.copyWithText(t4.text.removeTextAtRange([u2, u2 + 1])));
    else {
      let t4;
      const i3 = l2.text.getTextAtRange([0, a2]), n3 = h2.text.getTextAtRange([u2, h2.getLength()]), r3 = i3.appendText(n3);
      t4 = s2 !== c2 && 0 === a2 && l2.getAttributeLevel() >= h2.getAttributeLevel() ? h2.copyWithText(r3) : l2.copyWithText(r3);
      const o3 = c2 + 1 - s2;
      e2 = this.blockList.splice(s2, o3, t4);
    }
    return new this.constructor(e2);
  }
  moveTextFromRangeToPosition(t3, e2) {
    let i2;
    t3 = wt(t3);
    const [n2, r2] = t3;
    if (n2 <= e2 && e2 <= r2) return this;
    let o2 = this.getDocumentAtRange(t3), s2 = this.removeTextAtRange(t3);
    const a2 = n2 < e2;
    a2 && (e2 -= o2.getLength());
    const [l2, ...c2] = o2.getBlocks();
    return 0 === c2.length ? (i2 = l2.getTextWithoutBlockBreak(), a2 && (e2 += 1)) : i2 = l2.text, s2 = s2.insertTextAtRange(i2, e2), 0 === c2.length ? s2 : (o2 = new this.constructor(c2), e2 += i2.getLength(), s2.insertDocumentAtRange(o2, e2));
  }
  addAttributeAtRange(t3, e2, i2) {
    let { blockList: n2 } = this;
    return this.eachBlockAtRange(i2, (i3, r2, o2) => n2 = n2.editObjectAtIndex(o2, function() {
      return mt(t3) ? i3.addAttribute(t3, e2) : r2[0] === r2[1] ? i3 : i3.copyWithText(i3.text.addAttributeAtRange(t3, e2, r2));
    })), new this.constructor(n2);
  }
  addAttribute(t3, e2) {
    let { blockList: i2 } = this;
    return this.eachBlock((n2, r2) => i2 = i2.editObjectAtIndex(r2, () => n2.addAttribute(t3, e2))), new this.constructor(i2);
  }
  removeAttributeAtRange(t3, e2) {
    let { blockList: i2 } = this;
    return this.eachBlockAtRange(e2, function(e3, n2, r2) {
      mt(t3) ? i2 = i2.editObjectAtIndex(r2, () => e3.removeAttribute(t3)) : n2[0] !== n2[1] && (i2 = i2.editObjectAtIndex(r2, () => e3.copyWithText(e3.text.removeAttributeAtRange(t3, n2))));
    }), new this.constructor(i2);
  }
  updateAttributesForAttachment(t3, e2) {
    const i2 = this.getRangeOfAttachment(e2), [n2] = Array.from(i2), { index: r2 } = this.locationFromPosition(n2), o2 = this.getTextAtIndex(r2);
    return new this.constructor(this.blockList.editObjectAtIndex(r2, (i3) => i3.copyWithText(o2.updateAttributesForAttachment(t3, e2))));
  }
  removeAttributeForAttachment(t3, e2) {
    const i2 = this.getRangeOfAttachment(e2);
    return this.removeAttributeAtRange(t3, i2);
  }
  setHTMLAttributeAtPosition(t3, e2, i2) {
    const n2 = this.getBlockAtPosition(t3), r2 = n2.addHTMLAttribute(e2, i2);
    return this.replaceBlock(n2, r2);
  }
  insertBlockBreakAtRange(t3) {
    let e2;
    t3 = wt(t3);
    const [i2] = t3, { offset: n2 } = this.locationFromPosition(i2), r2 = this.removeTextAtRange(t3);
    return 0 === n2 && (e2 = [new Gi()]), new this.constructor(r2.blockList.insertSplittableListAtPosition(new zi(e2), i2));
  }
  applyBlockAttributeAtRange(t3, e2, i2) {
    const n2 = this.expandRangeToLineBreaksAndSplitBlocks(i2);
    let r2 = n2.document;
    i2 = n2.range;
    const o2 = mt(t3);
    if (o2.listAttribute) {
      r2 = r2.removeLastListAttributeAtRange(i2, { exceptAttributeName: t3 });
      const e3 = r2.convertLineBreaksToBlockBreaksInRange(i2);
      r2 = e3.document, i2 = e3.range;
    } else r2 = o2.exclusive ? r2.removeBlockAttributesAtRange(i2) : o2.terminal ? r2.removeLastTerminalAttributeAtRange(i2) : r2.consolidateBlocksAtRange(i2);
    return r2.addAttributeAtRange(t3, e2, i2);
  }
  removeLastListAttributeAtRange(t3) {
    let e2 = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {}, { blockList: i2 } = this;
    return this.eachBlockAtRange(t3, function(t4, n2, r2) {
      const o2 = t4.getLastAttribute();
      o2 && mt(o2).listAttribute && o2 !== e2.exceptAttributeName && (i2 = i2.editObjectAtIndex(r2, () => t4.removeAttribute(o2)));
    }), new this.constructor(i2);
  }
  removeLastTerminalAttributeAtRange(t3) {
    let { blockList: e2 } = this;
    return this.eachBlockAtRange(t3, function(t4, i2, n2) {
      const r2 = t4.getLastAttribute();
      r2 && mt(r2).terminal && (e2 = e2.editObjectAtIndex(n2, () => t4.removeAttribute(r2)));
    }), new this.constructor(e2);
  }
  removeBlockAttributesAtRange(t3) {
    let { blockList: e2 } = this;
    return this.eachBlockAtRange(t3, function(t4, i2, n2) {
      t4.hasAttributes() && (e2 = e2.editObjectAtIndex(n2, () => t4.copyWithoutAttributes()));
    }), new this.constructor(e2);
  }
  expandRangeToLineBreaksAndSplitBlocks(t3) {
    let e2;
    t3 = wt(t3);
    let [i2, n2] = t3;
    const r2 = this.locationFromPosition(i2), o2 = this.locationFromPosition(n2);
    let s2 = this;
    const a2 = s2.getBlockAtIndex(r2.index);
    if (r2.offset = a2.findLineBreakInDirectionFromPosition("backward", r2.offset), null != r2.offset && (e2 = s2.positionFromLocation(r2), s2 = s2.insertBlockBreakAtRange([e2, e2 + 1]), o2.index += 1, o2.offset -= s2.getBlockAtIndex(r2.index).getLength(), r2.index += 1), r2.offset = 0, 0 === o2.offset && o2.index > r2.index) o2.index -= 1, o2.offset = s2.getBlockAtIndex(o2.index).getBlockBreakPosition();
    else {
      const t4 = s2.getBlockAtIndex(o2.index);
      "\n" === t4.text.getStringAtRange([o2.offset - 1, o2.offset]) ? o2.offset -= 1 : o2.offset = t4.findLineBreakInDirectionFromPosition("forward", o2.offset), o2.offset !== t4.getBlockBreakPosition() && (e2 = s2.positionFromLocation(o2), s2 = s2.insertBlockBreakAtRange([e2, e2 + 1]));
    }
    return i2 = s2.positionFromLocation(r2), n2 = s2.positionFromLocation(o2), { document: s2, range: t3 = wt([i2, n2]) };
  }
  convertLineBreaksToBlockBreaksInRange(t3) {
    t3 = wt(t3);
    let [e2] = t3;
    const i2 = this.getStringAtRange(t3).slice(0, -1);
    let n2 = this;
    return i2.replace(/.*?\n/g, function(t4) {
      e2 += t4.length, n2 = n2.insertBlockBreakAtRange([e2 - 1, e2]);
    }), { document: n2, range: t3 };
  }
  consolidateBlocksAtRange(t3) {
    t3 = wt(t3);
    const [e2, i2] = t3, n2 = this.locationFromPosition(e2).index, r2 = this.locationFromPosition(i2).index;
    return new this.constructor(this.blockList.consolidateFromIndexToIndex(n2, r2));
  }
  getDocumentAtRange(t3) {
    t3 = wt(t3);
    const e2 = this.blockList.getSplittableListInRange(t3).toArray();
    return new this.constructor(e2);
  }
  getStringAtRange(t3) {
    let e2;
    const i2 = t3 = wt(t3);
    return i2[i2.length - 1] !== this.getLength() && (e2 = -1), this.getDocumentAtRange(t3).toString().slice(0, e2);
  }
  getBlockAtIndex(t3) {
    return this.blockList.getObjectAtIndex(t3);
  }
  getBlockAtPosition(t3) {
    const { index: e2 } = this.locationFromPosition(t3);
    return this.getBlockAtIndex(e2);
  }
  getTextAtIndex(t3) {
    var e2;
    return null === (e2 = this.getBlockAtIndex(t3)) || void 0 === e2 ? void 0 : e2.text;
  }
  getTextAtPosition(t3) {
    const { index: e2 } = this.locationFromPosition(t3);
    return this.getTextAtIndex(e2);
  }
  getPieceAtPosition(t3) {
    const { index: e2, offset: i2 } = this.locationFromPosition(t3);
    return this.getTextAtIndex(e2).getPieceAtPosition(i2);
  }
  getCharacterAtPosition(t3) {
    const { index: e2, offset: i2 } = this.locationFromPosition(t3);
    return this.getTextAtIndex(e2).getStringAtRange([i2, i2 + 1]);
  }
  getLength() {
    return this.blockList.getEndPosition();
  }
  getBlocks() {
    return this.blockList.toArray();
  }
  getBlockCount() {
    return this.blockList.length;
  }
  getEditCount() {
    return this.editCount;
  }
  eachBlock(t3) {
    return this.blockList.eachObject(t3);
  }
  eachBlockAtRange(t3, e2) {
    let i2, n2;
    t3 = wt(t3);
    const [r2, o2] = t3, s2 = this.locationFromPosition(r2), a2 = this.locationFromPosition(o2);
    if (s2.index === a2.index) return i2 = this.getBlockAtIndex(s2.index), n2 = [s2.offset, a2.offset], e2(i2, n2, s2.index);
    for (let t4 = s2.index; t4 <= a2.index; t4++) if (i2 = this.getBlockAtIndex(t4), i2) {
      switch (t4) {
        case s2.index:
          n2 = [s2.offset, i2.text.getLength()];
          break;
        case a2.index:
          n2 = [0, a2.offset];
          break;
        default:
          n2 = [0, i2.text.getLength()];
      }
      e2(i2, n2, t4);
    }
  }
  getCommonAttributesAtRange(t3) {
    t3 = wt(t3);
    const [e2] = t3;
    if (Lt(t3)) return this.getCommonAttributesAtPosition(e2);
    {
      const e3 = [], i2 = [];
      return this.eachBlockAtRange(t3, function(t4, n2) {
        if (n2[0] !== n2[1]) return e3.push(t4.text.getCommonAttributesAtRange(n2)), i2.push(sn(t4));
      }), Ht.fromCommonAttributesOfObjects(e3).merge(Ht.fromCommonAttributesOfObjects(i2)).toObject();
    }
  }
  getCommonAttributesAtPosition(t3) {
    let e2, i2;
    const { index: n2, offset: r2 } = this.locationFromPosition(t3), o2 = this.getBlockAtIndex(n2);
    if (!o2) return {};
    const s2 = sn(o2), a2 = o2.text.getAttributesAtPosition(r2), l2 = o2.text.getAttributesAtPosition(r2 - 1), c2 = Object.keys(W).filter((t4) => W[t4].inheritable);
    for (e2 in l2) i2 = l2[e2], (i2 === a2[e2] || c2.includes(e2)) && (s2[e2] = i2);
    return s2;
  }
  getRangeOfCommonAttributeAtPosition(t3, e2) {
    const { index: i2, offset: n2 } = this.locationFromPosition(e2), r2 = this.getTextAtIndex(i2), [o2, s2] = Array.from(r2.getExpandedRangeForAttributeAtOffset(t3, n2)), a2 = this.positionFromLocation({ index: i2, offset: o2 }), l2 = this.positionFromLocation({ index: i2, offset: s2 });
    return wt([a2, l2]);
  }
  getBaseBlockAttributes() {
    let t3 = this.getBlockAtIndex(0).getAttributes();
    for (let e2 = 1; e2 < this.getBlockCount(); e2++) {
      const i2 = this.getBlockAtIndex(e2).getAttributes(), n2 = Math.min(t3.length, i2.length);
      t3 = (() => {
        const e3 = [];
        for (let r2 = 0; r2 < n2 && i2[r2] === t3[r2]; r2++) e3.push(i2[r2]);
        return e3;
      })();
    }
    return t3;
  }
  getAttachmentById(t3) {
    for (const e2 of this.getAttachments()) if (e2.id === t3) return e2;
  }
  getAttachmentPieces() {
    let t3 = [];
    return this.blockList.eachObject((e2) => {
      let { text: i2 } = e2;
      return t3 = t3.concat(i2.getAttachmentPieces());
    }), t3;
  }
  getAttachments() {
    return this.getAttachmentPieces().map((t3) => t3.attachment);
  }
  getRangeOfAttachment(t3) {
    let e2 = 0;
    const i2 = this.blockList.toArray();
    for (let n2 = 0; n2 < i2.length; n2++) {
      const { text: r2 } = i2[n2], o2 = r2.getRangeOfAttachment(t3);
      if (o2) return wt([e2 + o2[0], e2 + o2[1]]);
      e2 += r2.getLength();
    }
  }
  getLocationRangeOfAttachment(t3) {
    const e2 = this.getRangeOfAttachment(t3);
    return this.locationRangeFromRange(e2);
  }
  getAttachmentPieceForAttachment(t3) {
    for (const e2 of this.getAttachmentPieces()) if (e2.attachment === t3) return e2;
  }
  findRangesForBlockAttribute(t3) {
    let e2 = 0;
    const i2 = [];
    return this.getBlocks().forEach((n2) => {
      const r2 = n2.getLength();
      n2.hasAttribute(t3) && i2.push([e2, e2 + r2]), e2 += r2;
    }), i2;
  }
  findRangesForTextAttribute(t3) {
    let { withValue: e2 } = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {}, i2 = 0, n2 = [];
    const r2 = [];
    return this.getPieces().forEach((o2) => {
      const s2 = o2.getLength();
      (function(i3) {
        return e2 ? i3.getAttribute(t3) === e2 : i3.hasAttribute(t3);
      })(o2) && (n2[1] === i2 ? n2[1] = i2 + s2 : r2.push(n2 = [i2, i2 + s2])), i2 += s2;
    }), r2;
  }
  locationFromPosition(t3) {
    const e2 = this.blockList.findIndexAndOffsetAtPosition(Math.max(0, t3));
    if (null != e2.index) return e2;
    {
      const t4 = this.getBlocks();
      return { index: t4.length - 1, offset: t4[t4.length - 1].getLength() };
    }
  }
  positionFromLocation(t3) {
    return this.blockList.findPositionAtIndexAndOffset(t3.index, t3.offset);
  }
  locationRangeFromPosition(t3) {
    return wt(this.locationFromPosition(t3));
  }
  locationRangeFromRange(t3) {
    if (!(t3 = wt(t3))) return;
    const [e2, i2] = Array.from(t3), n2 = this.locationFromPosition(e2), r2 = this.locationFromPosition(i2);
    return wt([n2, r2]);
  }
  rangeFromLocationRange(t3) {
    let e2;
    t3 = wt(t3);
    const i2 = this.positionFromLocation(t3[0]);
    return Lt(t3) || (e2 = this.positionFromLocation(t3[1])), wt([i2, e2]);
  }
  isEqualTo(t3) {
    return this.blockList.isEqualTo(null == t3 ? void 0 : t3.blockList);
  }
  getTexts() {
    return this.getBlocks().map((t3) => t3.text);
  }
  getPieces() {
    const t3 = [];
    return Array.from(this.getTexts()).forEach((e2) => {
      t3.push(...Array.from(e2.getPieces() || []));
    }), t3;
  }
  getObjects() {
    return this.getBlocks().concat(this.getTexts()).concat(this.getPieces());
  }
  toSerializableDocument() {
    const t3 = [];
    return this.blockList.eachObject((e2) => t3.push(e2.copyWithText(e2.text.toSerializableText()))), new this.constructor(t3);
  }
  toString() {
    return this.blockList.toString();
  }
  toJSON() {
    return this.blockList.toJSON();
  }
  toConsole() {
    return JSON.stringify(this.blockList.toArray().map((t3) => JSON.parse(t3.text.toConsole())));
  }
};
var sn = function(t3) {
  const e2 = {}, i2 = t3.getLastAttribute();
  return i2 && (e2[i2] = true), e2;
};
var an = function(t3) {
  let e2 = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {};
  return { string: t3 = Wt(t3), attributes: e2, type: "string" };
};
var ln = (t3, e2) => {
  try {
    return JSON.parse(t3.getAttribute("data-trix-".concat(e2)));
  } catch (t4) {
    return {};
  }
};
var cn = class extends q {
  static parse(t3, e2) {
    const i2 = new this(t3, e2);
    return i2.parse(), i2;
  }
  constructor(t3) {
    let { referenceElement: e2 } = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {};
    super(...arguments), this.html = t3, this.referenceElement = e2, this.blocks = [], this.blockElements = [], this.processedElements = [];
  }
  getDocument() {
    return on.fromJSON(this.blocks);
  }
  parse() {
    try {
      this.createHiddenContainer(), ui.setHTML(this.containerElement, this.html);
      const t3 = R(this.containerElement, { usingFilter: gn });
      for (; t3.nextNode(); ) this.processNode(t3.currentNode);
      return this.translateBlockElementMarginsToNewlines();
    } finally {
      this.removeHiddenContainer();
    }
  }
  createHiddenContainer() {
    return this.referenceElement ? (this.containerElement = this.referenceElement.cloneNode(false), this.containerElement.removeAttribute("id"), this.containerElement.setAttribute("data-trix-internal", ""), this.containerElement.style.display = "none", this.referenceElement.parentNode.insertBefore(this.containerElement, this.referenceElement.nextSibling)) : (this.containerElement = T({ tagName: "div", style: { display: "none" } }), document.body.appendChild(this.containerElement));
  }
  removeHiddenContainer() {
    return S(this.containerElement);
  }
  processNode(t3) {
    switch (t3.nodeType) {
      case Node.TEXT_NODE:
        if (!this.isInsignificantTextNode(t3)) return this.appendBlockForTextNode(t3), this.processTextNode(t3);
        break;
      case Node.ELEMENT_NODE:
        return this.appendBlockForElement(t3), this.processElement(t3);
    }
  }
  appendBlockForTextNode(t3) {
    const e2 = t3.parentNode;
    if (e2 === this.currentBlockElement && this.isBlockElement(t3.previousSibling)) return this.appendStringWithAttributes("\n");
    if (e2 === this.containerElement || this.isBlockElement(e2)) {
      var i2;
      const t4 = this.getBlockAttributes(e2), n2 = this.getBlockHTMLAttributes(e2);
      ot(t4, null === (i2 = this.currentBlock) || void 0 === i2 ? void 0 : i2.attributes) || (this.currentBlock = this.appendBlockForAttributesWithElement(t4, e2, n2), this.currentBlockElement = e2);
    }
  }
  appendBlockForElement(t3) {
    const e2 = this.isBlockElement(t3), i2 = C(this.currentBlockElement, t3);
    if (e2 && !this.isBlockElement(t3.firstChild)) {
      if (!this.isInsignificantTextNode(t3.firstChild) || !this.isBlockElement(t3.firstElementChild)) {
        const e3 = this.getBlockAttributes(t3), n2 = this.getBlockHTMLAttributes(t3);
        if (t3.firstChild) {
          if (i2 && ot(e3, this.currentBlock.attributes)) return this.appendStringWithAttributes("\n");
          this.currentBlock = this.appendBlockForAttributesWithElement(e3, t3, n2), this.currentBlockElement = t3;
        }
      }
    } else if (this.currentBlockElement && !i2 && !e2) {
      const e3 = this.findParentBlockElement(t3);
      if (e3) return this.appendBlockForElement(e3);
      this.currentBlock = this.appendEmptyBlock(), this.currentBlockElement = null;
    }
  }
  findParentBlockElement(t3) {
    let { parentElement: e2 } = t3;
    for (; e2 && e2 !== this.containerElement; ) {
      if (this.isBlockElement(e2) && this.blockElements.includes(e2)) return e2;
      e2 = e2.parentElement;
    }
    return null;
  }
  processTextNode(t3) {
    let e2 = t3.data;
    var i2;
    un(t3.parentNode) || (e2 = Vt(e2), fn2(null === (i2 = t3.previousSibling) || void 0 === i2 ? void 0 : i2.textContent) && (e2 = mn(e2)));
    return this.appendStringWithAttributes(e2, this.getTextAttributes(t3.parentNode));
  }
  processElement(t3) {
    let e2;
    if (P(t3)) {
      if (e2 = ln(t3, "attachment"), Object.keys(e2).length) {
        const i2 = this.getTextAttributes(t3);
        this.appendAttachmentWithAttributes(e2, i2), t3.innerHTML = "";
      }
      return this.processedElements.push(t3);
    }
    switch (k(t3)) {
      case "br":
        return this.isExtraBR(t3) || this.isBlockElement(t3.nextSibling) || this.appendStringWithAttributes("\n", this.getTextAttributes(t3)), this.processedElements.push(t3);
      case "img":
        e2 = { url: t3.getAttribute("src"), contentType: "image" };
        const i2 = ((t4) => {
          const e3 = t4.getAttribute("width"), i3 = t4.getAttribute("height"), n2 = {};
          return e3 && (n2.width = parseInt(e3, 10)), i3 && (n2.height = parseInt(i3, 10)), n2;
        })(t3);
        for (const t4 in i2) {
          const n2 = i2[t4];
          e2[t4] = n2;
        }
        return this.appendAttachmentWithAttributes(e2, this.getTextAttributes(t3)), this.processedElements.push(t3);
      case "tr":
        if (this.needsTableSeparator(t3)) return this.appendStringWithAttributes(j.tableRowSeparator);
        break;
      case "td":
        if (this.needsTableSeparator(t3)) return this.appendStringWithAttributes(j.tableCellSeparator);
    }
  }
  appendBlockForAttributesWithElement(t3, e2) {
    let i2 = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : {};
    this.blockElements.push(e2);
    const n2 = function() {
      return { text: [], attributes: arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {}, htmlAttributes: arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {} };
    }(t3, i2);
    return this.blocks.push(n2), n2;
  }
  appendEmptyBlock() {
    return this.appendBlockForAttributesWithElement([], null);
  }
  appendStringWithAttributes(t3, e2) {
    return this.appendPiece(an(t3, e2));
  }
  appendAttachmentWithAttributes(t3, e2) {
    return this.appendPiece(function(t4) {
      return { attachment: t4, attributes: arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {}, type: "attachment" };
    }(t3, e2));
  }
  appendPiece(t3) {
    return 0 === this.blocks.length && this.appendEmptyBlock(), this.blocks[this.blocks.length - 1].text.push(t3);
  }
  appendStringToTextAtIndex(t3, e2) {
    const { text: i2 } = this.blocks[e2], n2 = i2[i2.length - 1];
    if ("string" !== (null == n2 ? void 0 : n2.type)) return i2.push(an(t3));
    n2.string += t3;
  }
  prependStringToTextAtIndex(t3, e2) {
    const { text: i2 } = this.blocks[e2], n2 = i2[0];
    if ("string" !== (null == n2 ? void 0 : n2.type)) return i2.unshift(an(t3));
    n2.string = t3 + n2.string;
  }
  getTextAttributes(t3) {
    let e2;
    const i2 = {};
    for (const n2 in W) {
      const r2 = W[n2];
      if (r2.tagName && y(t3, { matchingSelector: r2.tagName, untilNode: this.containerElement })) i2[n2] = true;
      else if (r2.parser) {
        if (e2 = r2.parser(t3), e2) {
          let o2 = false;
          for (const i3 of this.findBlockElementAncestors(t3)) if (r2.parser(i3) === e2) {
            o2 = true;
            break;
          }
          o2 || (i2[n2] = e2);
        }
      } else r2.styleProperty && (e2 = t3.style[r2.styleProperty], e2 && (i2[n2] = e2));
    }
    if (P(t3)) {
      const n2 = ln(t3, "attributes");
      for (const t4 in n2) e2 = n2[t4], i2[t4] = e2;
    }
    return i2;
  }
  getBlockAttributes(t3) {
    const e2 = [];
    for (; t3 && t3 !== this.containerElement; ) {
      for (const r2 in n) {
        const o2 = n[r2];
        var i2;
        if (false !== o2.parse) {
          if (k(t3) === o2.tagName) (null !== (i2 = o2.test) && void 0 !== i2 && i2.call(o2, t3) || !o2.test) && (e2.push(r2), o2.listAttribute && e2.push(o2.listAttribute));
        }
      }
      t3 = t3.parentNode;
    }
    return e2.reverse();
  }
  getBlockHTMLAttributes(t3) {
    const e2 = {}, i2 = Object.values(n).find((e3) => e3.tagName === k(t3));
    return ((null == i2 ? void 0 : i2.htmlAttributes) || []).forEach((i3) => {
      t3.hasAttribute(i3) && (e2[i3] = t3.getAttribute(i3));
    }), e2;
  }
  findBlockElementAncestors(t3) {
    const e2 = [];
    for (; t3 && t3 !== this.containerElement; ) {
      const i2 = k(t3);
      L().includes(i2) && e2.push(t3), t3 = t3.parentNode;
    }
    return e2;
  }
  isBlockElement(t3) {
    if ((null == t3 ? void 0 : t3.nodeType) === Node.ELEMENT_NODE && !P(t3) && !y(t3, { matchingSelector: "td", untilNode: this.containerElement })) return L().includes(k(t3)) || "block" === window.getComputedStyle(t3).display;
  }
  isInsignificantTextNode(t3) {
    if ((null == t3 ? void 0 : t3.nodeType) !== Node.TEXT_NODE) return;
    if (!pn(t3.data)) return;
    const { parentNode: e2, previousSibling: i2, nextSibling: n2 } = t3;
    return hn(e2.previousSibling) && !this.isBlockElement(e2.previousSibling) || un(e2) ? void 0 : !i2 || this.isBlockElement(i2) || !n2 || this.isBlockElement(n2);
  }
  isExtraBR(t3) {
    return "br" === k(t3) && this.isBlockElement(t3.parentNode) && t3.parentNode.lastChild === t3;
  }
  needsTableSeparator(t3) {
    if (j.removeBlankTableCells) {
      var e2;
      const i2 = null === (e2 = t3.previousSibling) || void 0 === e2 ? void 0 : e2.textContent;
      return i2 && /\S/.test(i2);
    }
    return t3.previousSibling;
  }
  translateBlockElementMarginsToNewlines() {
    const t3 = this.getMarginOfDefaultBlockElement();
    for (let e2 = 0; e2 < this.blocks.length; e2++) {
      const i2 = this.getMarginOfBlockElementAtIndex(e2);
      i2 && (i2.top > 2 * t3.top && this.prependStringToTextAtIndex("\n", e2), i2.bottom > 2 * t3.bottom && this.appendStringToTextAtIndex("\n", e2));
    }
  }
  getMarginOfBlockElementAtIndex(t3) {
    const e2 = this.blockElements[t3];
    if (e2 && e2.textContent && !L().includes(k(e2)) && !this.processedElements.includes(e2)) return dn(e2);
  }
  getMarginOfDefaultBlockElement() {
    const t3 = T(n.default.tagName);
    return this.containerElement.appendChild(t3), dn(t3);
  }
};
var un = function(t3) {
  const { whiteSpace: e2 } = window.getComputedStyle(t3);
  return ["pre", "pre-wrap", "pre-line"].includes(e2);
};
var hn = (t3) => t3 && !fn2(t3.textContent);
var dn = function(t3) {
  const e2 = window.getComputedStyle(t3);
  if ("block" === e2.display) return { top: parseInt(e2.marginTop), bottom: parseInt(e2.marginBottom) };
};
var gn = function(t3) {
  return "style" === k(t3) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT;
};
var mn = (t3) => t3.replace(new RegExp("^".concat(Ut.source, "+")), "");
var pn = (t3) => new RegExp("^".concat(Ut.source, "*$")).test(t3);
var fn2 = (t3) => /\s$/.test(t3);
var bn = ["contenteditable", "data-trix-id", "data-trix-store-key", "data-trix-mutable", "data-trix-placeholder", "tabindex"];
var vn = "data-trix-serialized-attributes";
var An = "[".concat(vn, "]");
var yn = new RegExp("<!--block-->", "g");
var xn = { "application/json": function(t3) {
  let e2;
  if (t3 instanceof on) e2 = t3;
  else {
    if (!(t3 instanceof HTMLElement)) throw new Error("unserializable object");
    e2 = cn.parse(t3.innerHTML).getDocument();
  }
  return e2.toSerializableDocument().toJSONString();
}, "text/html": function(t3) {
  let e2;
  if (t3 instanceof on) e2 = Ci.render(t3);
  else {
    if (!(t3 instanceof HTMLElement)) throw new Error("unserializable object");
    e2 = t3.cloneNode(true);
  }
  return Array.from(e2.querySelectorAll("[data-trix-serialize=false]")).forEach((t4) => {
    S(t4);
  }), bn.forEach((t4) => {
    Array.from(e2.querySelectorAll("[".concat(t4, "]"))).forEach((e3) => {
      e3.removeAttribute(t4);
    });
  }), Array.from(e2.querySelectorAll(An)).forEach((t4) => {
    try {
      const e3 = JSON.parse(t4.getAttribute(vn));
      t4.removeAttribute(vn);
      for (const i2 in e3) {
        const n2 = e3[i2];
        t4.setAttribute(i2, n2);
      }
    } catch (t5) {
    }
  }), e2.innerHTML.replace(yn, "");
} };
var Cn = Object.freeze({ __proto__: null });
var En = class extends q {
  constructor(t3, e2) {
    super(...arguments), this.attachmentManager = t3, this.attachment = e2, this.id = this.attachment.id, this.file = this.attachment.file;
  }
  remove() {
    return this.attachmentManager.requestRemovalOfAttachment(this.attachment);
  }
};
En.proxyMethod("attachment.getAttribute"), En.proxyMethod("attachment.hasAttribute"), En.proxyMethod("attachment.setAttribute"), En.proxyMethod("attachment.getAttributes"), En.proxyMethod("attachment.setAttributes"), En.proxyMethod("attachment.isPending"), En.proxyMethod("attachment.isPreviewable"), En.proxyMethod("attachment.getURL"), En.proxyMethod("attachment.getHref"), En.proxyMethod("attachment.getFilename"), En.proxyMethod("attachment.getFilesize"), En.proxyMethod("attachment.getFormattedFilesize"), En.proxyMethod("attachment.getExtension"), En.proxyMethod("attachment.getContentType"), En.proxyMethod("attachment.getFile"), En.proxyMethod("attachment.setFile"), En.proxyMethod("attachment.releaseFile"), En.proxyMethod("attachment.getUploadProgress"), En.proxyMethod("attachment.setUploadProgress");
var Sn = class extends q {
  constructor() {
    let t3 = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : [];
    super(...arguments), this.managedAttachments = {}, Array.from(t3).forEach((t4) => {
      this.manageAttachment(t4);
    });
  }
  getAttachments() {
    const t3 = [];
    for (const e2 in this.managedAttachments) {
      const i2 = this.managedAttachments[e2];
      t3.push(i2);
    }
    return t3;
  }
  manageAttachment(t3) {
    return this.managedAttachments[t3.id] || (this.managedAttachments[t3.id] = new En(this, t3)), this.managedAttachments[t3.id];
  }
  attachmentIsManaged(t3) {
    return t3.id in this.managedAttachments;
  }
  requestRemovalOfAttachment(t3) {
    var e2, i2;
    if (this.attachmentIsManaged(t3)) return null === (e2 = this.delegate) || void 0 === e2 || null === (i2 = e2.attachmentManagerDidRequestRemovalOfAttachment) || void 0 === i2 ? void 0 : i2.call(e2, t3);
  }
  unmanageAttachment(t3) {
    const e2 = this.managedAttachments[t3.id];
    return delete this.managedAttachments[t3.id], e2;
  }
};
var Rn = class {
  constructor(t3) {
    this.composition = t3, this.document = this.composition.document;
    const e2 = this.composition.getSelectedRange();
    this.startPosition = e2[0], this.endPosition = e2[1], this.startLocation = this.document.locationFromPosition(this.startPosition), this.endLocation = this.document.locationFromPosition(this.endPosition), this.block = this.document.getBlockAtIndex(this.endLocation.index), this.breaksOnReturn = this.block.breaksOnReturn(), this.previousCharacter = this.block.text.getStringAtPosition(this.endLocation.offset - 1), this.nextCharacter = this.block.text.getStringAtPosition(this.endLocation.offset);
  }
  shouldInsertBlockBreak() {
    return this.block.hasAttributes() && this.block.isListItem() && !this.block.isEmpty() ? 0 !== this.startLocation.offset : this.breaksOnReturn && "\n" !== this.nextCharacter;
  }
  shouldBreakFormattedBlock() {
    return this.block.hasAttributes() && !this.block.isListItem() && (this.breaksOnReturn && "\n" === this.nextCharacter || "\n" === this.previousCharacter);
  }
  shouldDecreaseListLevel() {
    return this.block.hasAttributes() && this.block.isListItem() && this.block.isEmpty();
  }
  shouldPrependListItem() {
    return this.block.isListItem() && 0 === this.startLocation.offset && !this.block.isEmpty();
  }
  shouldRemoveLastBlockAttribute() {
    return this.block.hasAttributes() && !this.block.isListItem() && this.block.isEmpty();
  }
};
var kn = class extends q {
  constructor() {
    super(...arguments), this.document = new on(), this.attachments = [], this.currentAttributes = {}, this.revision = 0;
  }
  setDocument(t3) {
    var e2, i2;
    if (!t3.isEqualTo(this.document)) return this.document = t3, this.refreshAttachments(), this.revision++, null === (e2 = this.delegate) || void 0 === e2 || null === (i2 = e2.compositionDidChangeDocument) || void 0 === i2 ? void 0 : i2.call(e2, t3);
  }
  getSnapshot() {
    return { document: this.document, selectedRange: this.getSelectedRange() };
  }
  loadSnapshot(t3) {
    var e2, i2, n2, r2;
    let { document: o2, selectedRange: s2 } = t3;
    return null === (e2 = this.delegate) || void 0 === e2 || null === (i2 = e2.compositionWillLoadSnapshot) || void 0 === i2 || i2.call(e2), this.setDocument(null != o2 ? o2 : new on()), this.setSelection(null != s2 ? s2 : [0, 0]), null === (n2 = this.delegate) || void 0 === n2 || null === (r2 = n2.compositionDidLoadSnapshot) || void 0 === r2 ? void 0 : r2.call(n2);
  }
  insertText(t3) {
    let { updatePosition: e2 } = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : { updatePosition: true };
    const i2 = this.getSelectedRange();
    this.setDocument(this.document.insertTextAtRange(t3, i2));
    const n2 = i2[0], r2 = n2 + t3.getLength();
    return e2 && this.setSelection(r2), this.notifyDelegateOfInsertionAtRange([n2, r2]);
  }
  insertBlock() {
    let t3 = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : new Gi();
    const e2 = new on([t3]);
    return this.insertDocument(e2);
  }
  insertDocument() {
    let t3 = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : new on();
    const e2 = this.getSelectedRange();
    this.setDocument(this.document.insertDocumentAtRange(t3, e2));
    const i2 = e2[0], n2 = i2 + t3.getLength();
    return this.setSelection(n2), this.notifyDelegateOfInsertionAtRange([i2, n2]);
  }
  insertString(t3, e2) {
    const i2 = this.getCurrentTextAttributes(), n2 = Ki.textForStringWithAttributes(t3, i2);
    return this.insertText(n2, e2);
  }
  insertBlockBreak() {
    const t3 = this.getSelectedRange();
    this.setDocument(this.document.insertBlockBreakAtRange(t3));
    const e2 = t3[0], i2 = e2 + 1;
    return this.setSelection(i2), this.notifyDelegateOfInsertionAtRange([e2, i2]);
  }
  insertLineBreak() {
    const t3 = new Rn(this);
    if (t3.shouldDecreaseListLevel()) return this.decreaseListLevel(), this.setSelection(t3.startPosition);
    if (t3.shouldPrependListItem()) {
      const e2 = new on([t3.block.copyWithoutText()]);
      return this.insertDocument(e2);
    }
    return t3.shouldInsertBlockBreak() ? this.insertBlockBreak() : t3.shouldRemoveLastBlockAttribute() ? this.removeLastBlockAttribute() : t3.shouldBreakFormattedBlock() ? this.breakFormattedBlock(t3) : this.insertString("\n");
  }
  insertHTML(t3) {
    const e2 = cn.parse(t3).getDocument(), i2 = this.getSelectedRange();
    this.setDocument(this.document.mergeDocumentAtRange(e2, i2));
    const n2 = i2[0], r2 = n2 + e2.getLength() - 1;
    return this.setSelection(r2), this.notifyDelegateOfInsertionAtRange([n2, r2]);
  }
  replaceHTML(t3) {
    const e2 = cn.parse(t3).getDocument().copyUsingObjectsFromDocument(this.document), i2 = this.getLocationRange({ strict: false }), n2 = this.document.rangeFromLocationRange(i2);
    return this.setDocument(e2), this.setSelection(n2);
  }
  insertFile(t3) {
    return this.insertFiles([t3]);
  }
  insertFiles(t3) {
    const e2 = [];
    return Array.from(t3).forEach((t4) => {
      var i2;
      if (null !== (i2 = this.delegate) && void 0 !== i2 && i2.compositionShouldAcceptFile(t4)) {
        const i3 = Wi.attachmentForFile(t4);
        e2.push(i3);
      }
    }), this.insertAttachments(e2);
  }
  insertAttachment(t3) {
    return this.insertAttachments([t3]);
  }
  insertAttachments(t3) {
    let e2 = new Ki();
    return Array.from(t3).forEach((t4) => {
      var n2;
      const r2 = t4.getType(), o2 = null === (n2 = i[r2]) || void 0 === n2 ? void 0 : n2.presentation, s2 = this.getCurrentTextAttributes();
      o2 && (s2.presentation = o2);
      const a2 = Ki.textForAttachmentWithAttributes(t4, s2);
      e2 = e2.appendText(a2);
    }), this.insertText(e2);
  }
  shouldManageDeletingInDirection(t3) {
    const e2 = this.getLocationRange();
    if (Lt(e2)) {
      if ("backward" === t3 && 0 === e2[0].offset) return true;
      if (this.shouldManageMovingCursorInDirection(t3)) return true;
    } else if (e2[0].index !== e2[1].index) return true;
    return false;
  }
  deleteInDirection(t3) {
    let e2, i2, n2, { length: r2 } = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {};
    const o2 = this.getLocationRange();
    let s2 = this.getSelectedRange();
    const a2 = Lt(s2);
    if (a2 ? i2 = "backward" === t3 && 0 === o2[0].offset : n2 = o2[0].index !== o2[1].index, i2 && this.canDecreaseBlockAttributeLevel()) {
      const t4 = this.getBlock();
      if (t4.isListItem() ? this.decreaseListLevel() : this.decreaseBlockAttributeLevel(), this.setSelection(s2[0]), t4.isEmpty()) return false;
    }
    return a2 && (s2 = this.getExpandedRangeInDirection(t3, { length: r2 }), "backward" === t3 && (e2 = this.getAttachmentAtRange(s2))), e2 ? (this.editAttachment(e2), false) : (this.setDocument(this.document.removeTextAtRange(s2)), this.setSelection(s2[0]), !i2 && !n2 && void 0);
  }
  moveTextFromRange(t3) {
    const [e2] = Array.from(this.getSelectedRange());
    return this.setDocument(this.document.moveTextFromRangeToPosition(t3, e2)), this.setSelection(e2);
  }
  removeAttachment(t3) {
    const e2 = this.document.getRangeOfAttachment(t3);
    if (e2) return this.stopEditingAttachment(), this.setDocument(this.document.removeTextAtRange(e2)), this.setSelection(e2[0]);
  }
  removeLastBlockAttribute() {
    const [t3, e2] = Array.from(this.getSelectedRange()), i2 = this.document.getBlockAtPosition(e2);
    return this.removeCurrentAttribute(i2.getLastAttribute()), this.setSelection(t3);
  }
  insertPlaceholder() {
    return this.placeholderPosition = this.getPosition(), this.insertString(" ");
  }
  selectPlaceholder() {
    if (null != this.placeholderPosition) return this.setSelectedRange([this.placeholderPosition, this.placeholderPosition + 1]), this.getSelectedRange();
  }
  forgetPlaceholder() {
    this.placeholderPosition = null;
  }
  hasCurrentAttribute(t3) {
    const e2 = this.currentAttributes[t3];
    return null != e2 && false !== e2;
  }
  toggleCurrentAttribute(t3) {
    const e2 = !this.currentAttributes[t3];
    return e2 ? this.setCurrentAttribute(t3, e2) : this.removeCurrentAttribute(t3);
  }
  canSetCurrentAttribute(t3) {
    return mt(t3) ? this.canSetCurrentBlockAttribute(t3) : this.canSetCurrentTextAttribute(t3);
  }
  canSetCurrentTextAttribute(t3) {
    const e2 = this.getSelectedDocument();
    if (e2) {
      for (const t4 of Array.from(e2.getAttachments())) if (!t4.hasContent()) return false;
      return true;
    }
  }
  canSetCurrentBlockAttribute(t3) {
    const e2 = this.getBlock();
    if (e2) return !e2.isTerminalBlock();
  }
  setCurrentAttribute(t3, e2) {
    return mt(t3) ? this.setBlockAttribute(t3, e2) : (this.setTextAttribute(t3, e2), this.currentAttributes[t3] = e2, this.notifyDelegateOfCurrentAttributesChange());
  }
  setHTMLAtributeAtPosition(t3, e2, i2) {
    var n2;
    const r2 = this.document.getBlockAtPosition(t3), o2 = null === (n2 = mt(r2.getLastAttribute())) || void 0 === n2 ? void 0 : n2.htmlAttributes;
    if (r2 && null != o2 && o2.includes(e2)) {
      const n3 = this.document.setHTMLAttributeAtPosition(t3, e2, i2);
      this.setDocument(n3);
    }
  }
  setTextAttribute(t3, e2) {
    const i2 = this.getSelectedRange();
    if (!i2) return;
    const [n2, r2] = Array.from(i2);
    if (n2 !== r2) return this.setDocument(this.document.addAttributeAtRange(t3, e2, i2));
    if ("href" === t3) {
      const t4 = Ki.textForStringWithAttributes(e2, { href: e2 });
      return this.insertText(t4);
    }
  }
  setBlockAttribute(t3, e2) {
    const i2 = this.getSelectedRange();
    if (this.canSetCurrentAttribute(t3)) return this.setDocument(this.document.applyBlockAttributeAtRange(t3, e2, i2)), this.setSelection(i2);
  }
  removeCurrentAttribute(t3) {
    return mt(t3) ? (this.removeBlockAttribute(t3), this.updateCurrentAttributes()) : (this.removeTextAttribute(t3), delete this.currentAttributes[t3], this.notifyDelegateOfCurrentAttributesChange());
  }
  removeTextAttribute(t3) {
    const e2 = this.getSelectedRange();
    if (e2) return this.setDocument(this.document.removeAttributeAtRange(t3, e2));
  }
  removeBlockAttribute(t3) {
    const e2 = this.getSelectedRange();
    if (e2) return this.setDocument(this.document.removeAttributeAtRange(t3, e2));
  }
  canDecreaseNestingLevel() {
    var t3;
    return (null === (t3 = this.getBlock()) || void 0 === t3 ? void 0 : t3.getNestingLevel()) > 0;
  }
  canIncreaseNestingLevel() {
    var t3;
    const e2 = this.getBlock();
    if (e2) {
      if (null === (t3 = mt(e2.getLastNestableAttribute())) || void 0 === t3 || !t3.listAttribute) return e2.getNestingLevel() > 0;
      {
        const t4 = this.getPreviousBlock();
        if (t4) return function() {
          let t5 = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : [];
          return ot((arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : []).slice(0, t5.length), t5);
        }(t4.getListItemAttributes(), e2.getListItemAttributes());
      }
    }
  }
  decreaseNestingLevel() {
    const t3 = this.getBlock();
    if (t3) return this.setDocument(this.document.replaceBlock(t3, t3.decreaseNestingLevel()));
  }
  increaseNestingLevel() {
    const t3 = this.getBlock();
    if (t3) return this.setDocument(this.document.replaceBlock(t3, t3.increaseNestingLevel()));
  }
  canDecreaseBlockAttributeLevel() {
    var t3;
    return (null === (t3 = this.getBlock()) || void 0 === t3 ? void 0 : t3.getAttributeLevel()) > 0;
  }
  decreaseBlockAttributeLevel() {
    var t3;
    const e2 = null === (t3 = this.getBlock()) || void 0 === t3 ? void 0 : t3.getLastAttribute();
    if (e2) return this.removeCurrentAttribute(e2);
  }
  decreaseListLevel() {
    let [t3] = Array.from(this.getSelectedRange());
    const { index: e2 } = this.document.locationFromPosition(t3);
    let i2 = e2;
    const n2 = this.getBlock().getAttributeLevel();
    let r2 = this.document.getBlockAtIndex(i2 + 1);
    for (; r2 && r2.isListItem() && !(r2.getAttributeLevel() <= n2); ) i2++, r2 = this.document.getBlockAtIndex(i2 + 1);
    t3 = this.document.positionFromLocation({ index: e2, offset: 0 });
    const o2 = this.document.positionFromLocation({ index: i2, offset: 0 });
    return this.setDocument(this.document.removeLastListAttributeAtRange([t3, o2]));
  }
  updateCurrentAttributes() {
    const t3 = this.getSelectedRange({ ignoreLock: true });
    if (t3) {
      const e2 = this.document.getCommonAttributesAtRange(t3);
      if (Array.from(gt()).forEach((t4) => {
        e2[t4] || this.canSetCurrentAttribute(t4) || (e2[t4] = false);
      }), !Tt(e2, this.currentAttributes)) return this.currentAttributes = e2, this.notifyDelegateOfCurrentAttributesChange();
    }
  }
  getCurrentAttributes() {
    return m.call({}, this.currentAttributes);
  }
  getCurrentTextAttributes() {
    const t3 = {};
    for (const e2 in this.currentAttributes) {
      const i2 = this.currentAttributes[e2];
      false !== i2 && ft(e2) && (t3[e2] = i2);
    }
    return t3;
  }
  freezeSelection() {
    return this.setCurrentAttribute("frozen", true);
  }
  thawSelection() {
    return this.removeCurrentAttribute("frozen");
  }
  hasFrozenSelection() {
    return this.hasCurrentAttribute("frozen");
  }
  setSelection(t3) {
    var e2;
    const i2 = this.document.locationRangeFromRange(t3);
    return null === (e2 = this.delegate) || void 0 === e2 ? void 0 : e2.compositionDidRequestChangingSelectionToLocationRange(i2);
  }
  getSelectedRange() {
    const t3 = this.getLocationRange();
    if (t3) return this.document.rangeFromLocationRange(t3);
  }
  setSelectedRange(t3) {
    const e2 = this.document.locationRangeFromRange(t3);
    return this.getSelectionManager().setLocationRange(e2);
  }
  getPosition() {
    const t3 = this.getLocationRange();
    if (t3) return this.document.positionFromLocation(t3[0]);
  }
  getLocationRange(t3) {
    return this.targetLocationRange ? this.targetLocationRange : this.getSelectionManager().getLocationRange(t3) || wt({ index: 0, offset: 0 });
  }
  withTargetLocationRange(t3, e2) {
    let i2;
    this.targetLocationRange = t3;
    try {
      i2 = e2();
    } finally {
      this.targetLocationRange = null;
    }
    return i2;
  }
  withTargetRange(t3, e2) {
    const i2 = this.document.locationRangeFromRange(t3);
    return this.withTargetLocationRange(i2, e2);
  }
  withTargetDOMRange(t3, e2) {
    const i2 = this.createLocationRangeFromDOMRange(t3, { strict: false });
    return this.withTargetLocationRange(i2, e2);
  }
  getExpandedRangeInDirection(t3) {
    let { length: e2 } = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {}, [i2, n2] = Array.from(this.getSelectedRange());
    return "backward" === t3 ? e2 ? i2 -= e2 : i2 = this.translateUTF16PositionFromOffset(i2, -1) : e2 ? n2 += e2 : n2 = this.translateUTF16PositionFromOffset(n2, 1), wt([i2, n2]);
  }
  shouldManageMovingCursorInDirection(t3) {
    if (this.editingAttachment) return true;
    const e2 = this.getExpandedRangeInDirection(t3);
    return null != this.getAttachmentAtRange(e2);
  }
  moveCursorInDirection(t3) {
    let e2, i2;
    if (this.editingAttachment) i2 = this.document.getRangeOfAttachment(this.editingAttachment);
    else {
      const n2 = this.getSelectedRange();
      i2 = this.getExpandedRangeInDirection(t3), e2 = !Dt(n2, i2);
    }
    if ("backward" === t3 ? this.setSelectedRange(i2[0]) : this.setSelectedRange(i2[1]), e2) {
      const t4 = this.getAttachmentAtRange(i2);
      if (t4) return this.editAttachment(t4);
    }
  }
  expandSelectionInDirection(t3) {
    let { length: e2 } = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {};
    const i2 = this.getExpandedRangeInDirection(t3, { length: e2 });
    return this.setSelectedRange(i2);
  }
  expandSelectionForEditing() {
    if (this.hasCurrentAttribute("href")) return this.expandSelectionAroundCommonAttribute("href");
  }
  expandSelectionAroundCommonAttribute(t3) {
    const e2 = this.getPosition(), i2 = this.document.getRangeOfCommonAttributeAtPosition(t3, e2);
    return this.setSelectedRange(i2);
  }
  selectionContainsAttachments() {
    var t3;
    return (null === (t3 = this.getSelectedAttachments()) || void 0 === t3 ? void 0 : t3.length) > 0;
  }
  selectionIsInCursorTarget() {
    return this.editingAttachment || this.positionIsCursorTarget(this.getPosition());
  }
  positionIsCursorTarget(t3) {
    const e2 = this.document.locationFromPosition(t3);
    if (e2) return this.locationIsCursorTarget(e2);
  }
  positionIsBlockBreak(t3) {
    var e2;
    return null === (e2 = this.document.getPieceAtPosition(t3)) || void 0 === e2 ? void 0 : e2.isBlockBreak();
  }
  getSelectedDocument() {
    const t3 = this.getSelectedRange();
    if (t3) return this.document.getDocumentAtRange(t3);
  }
  getSelectedAttachments() {
    var t3;
    return null === (t3 = this.getSelectedDocument()) || void 0 === t3 ? void 0 : t3.getAttachments();
  }
  getAttachments() {
    return this.attachments.slice(0);
  }
  refreshAttachments() {
    const t3 = this.document.getAttachments(), { added: e2, removed: i2 } = function() {
      let t4 = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : [], e3 = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : [];
      const i3 = [], n2 = [], r2 = /* @__PURE__ */ new Set();
      t4.forEach((t5) => {
        r2.add(t5);
      });
      const o2 = /* @__PURE__ */ new Set();
      return e3.forEach((t5) => {
        o2.add(t5), r2.has(t5) || i3.push(t5);
      }), t4.forEach((t5) => {
        o2.has(t5) || n2.push(t5);
      }), { added: i3, removed: n2 };
    }(this.attachments, t3);
    return this.attachments = t3, Array.from(i2).forEach((t4) => {
      var e3, i3;
      t4.delegate = null, null === (e3 = this.delegate) || void 0 === e3 || null === (i3 = e3.compositionDidRemoveAttachment) || void 0 === i3 || i3.call(e3, t4);
    }), (() => {
      const t4 = [];
      return Array.from(e2).forEach((e3) => {
        var i3, n2;
        e3.delegate = this, t4.push(null === (i3 = this.delegate) || void 0 === i3 || null === (n2 = i3.compositionDidAddAttachment) || void 0 === n2 ? void 0 : n2.call(i3, e3));
      }), t4;
    })();
  }
  attachmentDidChangeAttributes(t3) {
    var e2, i2;
    return this.revision++, null === (e2 = this.delegate) || void 0 === e2 || null === (i2 = e2.compositionDidEditAttachment) || void 0 === i2 ? void 0 : i2.call(e2, t3);
  }
  attachmentDidChangePreviewURL(t3) {
    var e2, i2;
    return this.revision++, null === (e2 = this.delegate) || void 0 === e2 || null === (i2 = e2.compositionDidChangeAttachmentPreviewURL) || void 0 === i2 ? void 0 : i2.call(e2, t3);
  }
  editAttachment(t3, e2) {
    var i2, n2;
    if (t3 !== this.editingAttachment) return this.stopEditingAttachment(), this.editingAttachment = t3, null === (i2 = this.delegate) || void 0 === i2 || null === (n2 = i2.compositionDidStartEditingAttachment) || void 0 === n2 ? void 0 : n2.call(i2, this.editingAttachment, e2);
  }
  stopEditingAttachment() {
    var t3, e2;
    this.editingAttachment && (null === (t3 = this.delegate) || void 0 === t3 || null === (e2 = t3.compositionDidStopEditingAttachment) || void 0 === e2 || e2.call(t3, this.editingAttachment), this.editingAttachment = null);
  }
  updateAttributesForAttachment(t3, e2) {
    return this.setDocument(this.document.updateAttributesForAttachment(t3, e2));
  }
  removeAttributeForAttachment(t3, e2) {
    return this.setDocument(this.document.removeAttributeForAttachment(t3, e2));
  }
  breakFormattedBlock(t3) {
    let { document: e2 } = t3;
    const { block: i2 } = t3;
    let n2 = t3.startPosition, r2 = [n2 - 1, n2];
    i2.getBlockBreakPosition() === t3.startLocation.offset ? (i2.breaksOnReturn() && "\n" === t3.nextCharacter ? n2 += 1 : e2 = e2.removeTextAtRange(r2), r2 = [n2, n2]) : "\n" === t3.nextCharacter ? "\n" === t3.previousCharacter ? r2 = [n2 - 1, n2 + 1] : (r2 = [n2, n2 + 1], n2 += 1) : t3.startLocation.offset - 1 != 0 && (n2 += 1);
    const o2 = new on([i2.removeLastAttribute().copyWithoutText()]);
    return this.setDocument(e2.insertDocumentAtRange(o2, r2)), this.setSelection(n2);
  }
  getPreviousBlock() {
    const t3 = this.getLocationRange();
    if (t3) {
      const { index: e2 } = t3[0];
      if (e2 > 0) return this.document.getBlockAtIndex(e2 - 1);
    }
  }
  getBlock() {
    const t3 = this.getLocationRange();
    if (t3) return this.document.getBlockAtIndex(t3[0].index);
  }
  getAttachmentAtRange(t3) {
    const e2 = this.document.getDocumentAtRange(t3);
    if (e2.toString() === "".concat("\uFFFC", "\n")) return e2.getAttachments()[0];
  }
  notifyDelegateOfCurrentAttributesChange() {
    var t3, e2;
    return null === (t3 = this.delegate) || void 0 === t3 || null === (e2 = t3.compositionDidChangeCurrentAttributes) || void 0 === e2 ? void 0 : e2.call(t3, this.currentAttributes);
  }
  notifyDelegateOfInsertionAtRange(t3) {
    var e2, i2;
    return null === (e2 = this.delegate) || void 0 === e2 || null === (i2 = e2.compositionDidPerformInsertionAtRange) || void 0 === i2 ? void 0 : i2.call(e2, t3);
  }
  translateUTF16PositionFromOffset(t3, e2) {
    const i2 = this.document.toUTF16String(), n2 = i2.offsetFromUCS2Offset(t3);
    return i2.offsetToUCS2Offset(n2 + e2);
  }
};
kn.proxyMethod("getSelectionManager().getPointRange"), kn.proxyMethod("getSelectionManager().setLocationRangeFromPointRange"), kn.proxyMethod("getSelectionManager().createLocationRangeFromDOMRange"), kn.proxyMethod("getSelectionManager().locationIsCursorTarget"), kn.proxyMethod("getSelectionManager().selectionIsExpanded"), kn.proxyMethod("delegate?.getSelectionManager");
var Tn = class extends q {
  constructor(t3) {
    super(...arguments), this.composition = t3, this.undoEntries = [], this.redoEntries = [];
  }
  recordUndoEntry(t3) {
    let { context: e2, consolidatable: i2 } = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {};
    const n2 = this.undoEntries.slice(-1)[0];
    if (!i2 || !wn(n2, t3, e2)) {
      const i3 = this.createEntry({ description: t3, context: e2 });
      this.undoEntries.push(i3), this.redoEntries = [];
    }
  }
  undo() {
    const t3 = this.undoEntries.pop();
    if (t3) {
      const e2 = this.createEntry(t3);
      return this.redoEntries.push(e2), this.composition.loadSnapshot(t3.snapshot);
    }
  }
  redo() {
    const t3 = this.redoEntries.pop();
    if (t3) {
      const e2 = this.createEntry(t3);
      return this.undoEntries.push(e2), this.composition.loadSnapshot(t3.snapshot);
    }
  }
  canUndo() {
    return this.undoEntries.length > 0;
  }
  canRedo() {
    return this.redoEntries.length > 0;
  }
  createEntry() {
    let { description: t3, context: e2 } = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {};
    return { description: null == t3 ? void 0 : t3.toString(), context: JSON.stringify(e2), snapshot: this.composition.getSnapshot() };
  }
};
var wn = (t3, e2, i2) => (null == t3 ? void 0 : t3.description) === (null == e2 ? void 0 : e2.toString()) && (null == t3 ? void 0 : t3.context) === JSON.stringify(i2);
var Ln = "attachmentGallery";
var Dn = class {
  constructor(t3) {
    this.document = t3.document, this.selectedRange = t3.selectedRange;
  }
  perform() {
    return this.removeBlockAttribute(), this.applyBlockAttribute();
  }
  getSnapshot() {
    return { document: this.document, selectedRange: this.selectedRange };
  }
  removeBlockAttribute() {
    return this.findRangesOfBlocks().map((t3) => this.document = this.document.removeAttributeAtRange(Ln, t3));
  }
  applyBlockAttribute() {
    let t3 = 0;
    this.findRangesOfPieces().forEach((e2) => {
      e2[1] - e2[0] > 1 && (e2[0] += t3, e2[1] += t3, "\n" !== this.document.getCharacterAtPosition(e2[1]) && (this.document = this.document.insertBlockBreakAtRange(e2[1]), e2[1] < this.selectedRange[1] && this.moveSelectedRangeForward(), e2[1]++, t3++), 0 !== e2[0] && "\n" !== this.document.getCharacterAtPosition(e2[0] - 1) && (this.document = this.document.insertBlockBreakAtRange(e2[0]), e2[0] < this.selectedRange[0] && this.moveSelectedRangeForward(), e2[0]++, t3++), this.document = this.document.applyBlockAttributeAtRange(Ln, true, e2));
    });
  }
  findRangesOfBlocks() {
    return this.document.findRangesForBlockAttribute(Ln);
  }
  findRangesOfPieces() {
    return this.document.findRangesForTextAttribute("presentation", { withValue: "gallery" });
  }
  moveSelectedRangeForward() {
    this.selectedRange[0] += 1, this.selectedRange[1] += 1;
  }
};
var Nn = function(t3) {
  const e2 = new Dn(t3);
  return e2.perform(), e2.getSnapshot();
};
var In = [Nn];
var On = class {
  constructor(t3, e2, i2) {
    this.insertFiles = this.insertFiles.bind(this), this.composition = t3, this.selectionManager = e2, this.element = i2, this.undoManager = new Tn(this.composition), this.filters = In.slice(0);
  }
  loadDocument(t3) {
    return this.loadSnapshot({ document: t3, selectedRange: [0, 0] });
  }
  loadHTML() {
    let t3 = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : "";
    const e2 = cn.parse(t3, { referenceElement: this.element }).getDocument();
    return this.loadDocument(e2);
  }
  loadJSON(t3) {
    let { document: e2, selectedRange: i2 } = t3;
    return e2 = on.fromJSON(e2), this.loadSnapshot({ document: e2, selectedRange: i2 });
  }
  loadSnapshot(t3) {
    return this.undoManager = new Tn(this.composition), this.composition.loadSnapshot(t3);
  }
  getDocument() {
    return this.composition.document;
  }
  getSelectedDocument() {
    return this.composition.getSelectedDocument();
  }
  getSnapshot() {
    return this.composition.getSnapshot();
  }
  toJSON() {
    return this.getSnapshot();
  }
  deleteInDirection(t3) {
    return this.composition.deleteInDirection(t3);
  }
  insertAttachment(t3) {
    return this.composition.insertAttachment(t3);
  }
  insertAttachments(t3) {
    return this.composition.insertAttachments(t3);
  }
  insertDocument(t3) {
    return this.composition.insertDocument(t3);
  }
  insertFile(t3) {
    return this.composition.insertFile(t3);
  }
  insertFiles(t3) {
    return this.composition.insertFiles(t3);
  }
  insertHTML(t3) {
    return this.composition.insertHTML(t3);
  }
  insertString(t3) {
    return this.composition.insertString(t3);
  }
  insertText(t3) {
    return this.composition.insertText(t3);
  }
  insertLineBreak() {
    return this.composition.insertLineBreak();
  }
  getSelectedRange() {
    return this.composition.getSelectedRange();
  }
  getPosition() {
    return this.composition.getPosition();
  }
  getClientRectAtPosition(t3) {
    const e2 = this.getDocument().locationRangeFromRange([t3, t3 + 1]);
    return this.selectionManager.getClientRectAtLocationRange(e2);
  }
  expandSelectionInDirection(t3) {
    return this.composition.expandSelectionInDirection(t3);
  }
  moveCursorInDirection(t3) {
    return this.composition.moveCursorInDirection(t3);
  }
  setSelectedRange(t3) {
    return this.composition.setSelectedRange(t3);
  }
  activateAttribute(t3) {
    let e2 = !(arguments.length > 1 && void 0 !== arguments[1]) || arguments[1];
    return this.composition.setCurrentAttribute(t3, e2);
  }
  attributeIsActive(t3) {
    return this.composition.hasCurrentAttribute(t3);
  }
  canActivateAttribute(t3) {
    return this.composition.canSetCurrentAttribute(t3);
  }
  deactivateAttribute(t3) {
    return this.composition.removeCurrentAttribute(t3);
  }
  setHTMLAtributeAtPosition(t3, e2, i2) {
    this.composition.setHTMLAtributeAtPosition(t3, e2, i2);
  }
  canDecreaseNestingLevel() {
    return this.composition.canDecreaseNestingLevel();
  }
  canIncreaseNestingLevel() {
    return this.composition.canIncreaseNestingLevel();
  }
  decreaseNestingLevel() {
    if (this.canDecreaseNestingLevel()) return this.composition.decreaseNestingLevel();
  }
  increaseNestingLevel() {
    if (this.canIncreaseNestingLevel()) return this.composition.increaseNestingLevel();
  }
  canRedo() {
    return this.undoManager.canRedo();
  }
  canUndo() {
    return this.undoManager.canUndo();
  }
  recordUndoEntry(t3) {
    let { context: e2, consolidatable: i2 } = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {};
    return this.undoManager.recordUndoEntry(t3, { context: e2, consolidatable: i2 });
  }
  redo() {
    if (this.canRedo()) return this.undoManager.redo();
  }
  undo() {
    if (this.canUndo()) return this.undoManager.undo();
  }
};
var Fn = class {
  constructor(t3) {
    this.element = t3;
  }
  findLocationFromContainerAndOffset(t3, e2) {
    let { strict: i2 } = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : { strict: true }, n2 = 0, r2 = false;
    const o2 = { index: 0, offset: 0 }, s2 = this.findAttachmentElementParentForNode(t3);
    s2 && (t3 = s2.parentNode, e2 = E(s2));
    const a2 = R(this.element, { usingFilter: _n });
    for (; a2.nextNode(); ) {
      const s3 = a2.currentNode;
      if (s3 === t3 && B(t3)) {
        F(s3) || (o2.offset += e2);
        break;
      }
      if (s3.parentNode === t3) {
        if (n2++ === e2) break;
      } else if (!C(t3, s3) && n2 > 0) break;
      N(s3, { strict: i2 }) ? (r2 && o2.index++, o2.offset = 0, r2 = true) : o2.offset += Pn(s3);
    }
    return o2;
  }
  findContainerAndOffsetFromLocation(t3) {
    let e2, i2;
    if (0 === t3.index && 0 === t3.offset) {
      for (e2 = this.element, i2 = 0; e2.firstChild; ) if (e2 = e2.firstChild, D(e2)) {
        i2 = 1;
        break;
      }
      return [e2, i2];
    }
    let [n2, r2] = this.findNodeAndOffsetFromLocation(t3);
    if (n2) {
      if (B(n2)) 0 === Pn(n2) ? (e2 = n2.parentNode.parentNode, i2 = E(n2.parentNode), F(n2, { name: "right" }) && i2++) : (e2 = n2, i2 = t3.offset - r2);
      else {
        if (e2 = n2.parentNode, !N(n2.previousSibling) && !D(e2)) for (; n2 === e2.lastChild && (n2 = e2, e2 = e2.parentNode, !D(e2)); ) ;
        i2 = E(n2), 0 !== t3.offset && i2++;
      }
      return [e2, i2];
    }
  }
  findNodeAndOffsetFromLocation(t3) {
    let e2, i2, n2 = 0;
    for (const r2 of this.getSignificantNodesForIndex(t3.index)) {
      const o2 = Pn(r2);
      if (t3.offset <= n2 + o2) if (B(r2)) {
        if (e2 = r2, i2 = n2, t3.offset === i2 && F(e2)) break;
      } else e2 || (e2 = r2, i2 = n2);
      if (n2 += o2, n2 > t3.offset) break;
    }
    return [e2, i2];
  }
  findAttachmentElementParentForNode(t3) {
    for (; t3 && t3 !== this.element; ) {
      if (P(t3)) return t3;
      t3 = t3.parentNode;
    }
  }
  getSignificantNodesForIndex(t3) {
    const e2 = [], i2 = R(this.element, { usingFilter: Mn });
    let n2 = false;
    for (; i2.nextNode(); ) {
      const o2 = i2.currentNode;
      var r2;
      if (I(o2)) {
        if (null != r2 ? r2++ : r2 = 0, r2 === t3) n2 = true;
        else if (n2) break;
      } else n2 && e2.push(o2);
    }
    return e2;
  }
};
var Pn = function(t3) {
  if (t3.nodeType === Node.TEXT_NODE) {
    if (F(t3)) return 0;
    return t3.textContent.length;
  }
  return "br" === k(t3) || P(t3) ? 1 : 0;
};
var Mn = function(t3) {
  return Bn(t3) === NodeFilter.FILTER_ACCEPT ? _n(t3) : NodeFilter.FILTER_REJECT;
};
var Bn = function(t3) {
  return M(t3) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT;
};
var _n = function(t3) {
  return P(t3.parentNode) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT;
};
var jn = class {
  createDOMRangeFromPoint(t3) {
    let e2, { x: i2, y: n2 } = t3;
    if (document.caretPositionFromPoint) {
      const { offsetNode: t4, offset: r2 } = document.caretPositionFromPoint(i2, n2);
      return e2 = document.createRange(), e2.setStart(t4, r2), e2;
    }
    if (document.caretRangeFromPoint) return document.caretRangeFromPoint(i2, n2);
    if (document.body.createTextRange) {
      const t4 = Mt();
      try {
        const t5 = document.body.createTextRange();
        t5.moveToPoint(i2, n2), t5.select();
      } catch (t5) {
      }
      return e2 = Mt(), Bt(t4), e2;
    }
  }
  getClientRectsForDOMRange(t3) {
    const e2 = Array.from(t3.getClientRects());
    return [e2[0], e2[e2.length - 1]];
  }
};
var Wn = class extends q {
  constructor(t3) {
    super(...arguments), this.didMouseDown = this.didMouseDown.bind(this), this.selectionDidChange = this.selectionDidChange.bind(this), this.element = t3, this.locationMapper = new Fn(this.element), this.pointMapper = new jn(), this.lockCount = 0, b("mousedown", { onElement: this.element, withCallback: this.didMouseDown });
  }
  getLocationRange() {
    let t3 = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {};
    return false === t3.strict ? this.createLocationRangeFromDOMRange(Mt()) : t3.ignoreLock ? this.currentLocationRange : this.lockedLocationRange ? this.lockedLocationRange : this.currentLocationRange;
  }
  setLocationRange(t3) {
    if (this.lockedLocationRange) return;
    t3 = wt(t3);
    const e2 = this.createDOMRangeFromLocationRange(t3);
    e2 && (Bt(e2), this.updateCurrentLocationRange(t3));
  }
  setLocationRangeFromPointRange(t3) {
    t3 = wt(t3);
    const e2 = this.getLocationAtPoint(t3[0]), i2 = this.getLocationAtPoint(t3[1]);
    this.setLocationRange([e2, i2]);
  }
  getClientRectAtLocationRange(t3) {
    const e2 = this.createDOMRangeFromLocationRange(t3);
    if (e2) return this.getClientRectsForDOMRange(e2)[1];
  }
  locationIsCursorTarget(t3) {
    const e2 = Array.from(this.findNodeAndOffsetFromLocation(t3))[0];
    return F(e2);
  }
  lock() {
    0 == this.lockCount++ && (this.updateCurrentLocationRange(), this.lockedLocationRange = this.getLocationRange());
  }
  unlock() {
    if (0 == --this.lockCount) {
      const { lockedLocationRange: t3 } = this;
      if (this.lockedLocationRange = null, null != t3) return this.setLocationRange(t3);
    }
  }
  clearSelection() {
    var t3;
    return null === (t3 = Pt()) || void 0 === t3 ? void 0 : t3.removeAllRanges();
  }
  selectionIsCollapsed() {
    var t3;
    return true === (null === (t3 = Mt()) || void 0 === t3 ? void 0 : t3.collapsed);
  }
  selectionIsExpanded() {
    return !this.selectionIsCollapsed();
  }
  createLocationRangeFromDOMRange(t3, e2) {
    if (null == t3 || !this.domRangeWithinElement(t3)) return;
    const i2 = this.findLocationFromContainerAndOffset(t3.startContainer, t3.startOffset, e2);
    if (!i2) return;
    const n2 = t3.collapsed ? void 0 : this.findLocationFromContainerAndOffset(t3.endContainer, t3.endOffset, e2);
    return wt([i2, n2]);
  }
  didMouseDown() {
    return this.pauseTemporarily();
  }
  pauseTemporarily() {
    let t3;
    this.paused = true;
    const e2 = () => {
      if (this.paused = false, clearTimeout(i2), Array.from(t3).forEach((t4) => {
        t4.destroy();
      }), C(document, this.element)) return this.selectionDidChange();
    }, i2 = setTimeout(e2, 200);
    t3 = ["mousemove", "keydown"].map((t4) => b(t4, { onElement: document, withCallback: e2 }));
  }
  selectionDidChange() {
    if (!this.paused && !x(this.element)) return this.updateCurrentLocationRange();
  }
  updateCurrentLocationRange(t3) {
    var e2, i2;
    if ((null != t3 ? t3 : t3 = this.createLocationRangeFromDOMRange(Mt())) && !Dt(t3, this.currentLocationRange)) return this.currentLocationRange = t3, null === (e2 = this.delegate) || void 0 === e2 || null === (i2 = e2.locationRangeDidChange) || void 0 === i2 ? void 0 : i2.call(e2, this.currentLocationRange.slice(0));
  }
  createDOMRangeFromLocationRange(t3) {
    const e2 = this.findContainerAndOffsetFromLocation(t3[0]), i2 = Lt(t3) ? e2 : this.findContainerAndOffsetFromLocation(t3[1]) || e2;
    if (null != e2 && null != i2) {
      const t4 = document.createRange();
      return t4.setStart(...Array.from(e2 || [])), t4.setEnd(...Array.from(i2 || [])), t4;
    }
  }
  getLocationAtPoint(t3) {
    const e2 = this.createDOMRangeFromPoint(t3);
    var i2;
    if (e2) return null === (i2 = this.createLocationRangeFromDOMRange(e2)) || void 0 === i2 ? void 0 : i2[0];
  }
  domRangeWithinElement(t3) {
    return t3.collapsed ? C(this.element, t3.startContainer) : C(this.element, t3.startContainer) && C(this.element, t3.endContainer);
  }
};
Wn.proxyMethod("locationMapper.findLocationFromContainerAndOffset"), Wn.proxyMethod("locationMapper.findContainerAndOffsetFromLocation"), Wn.proxyMethod("locationMapper.findNodeAndOffsetFromLocation"), Wn.proxyMethod("pointMapper.createDOMRangeFromPoint"), Wn.proxyMethod("pointMapper.getClientRectsForDOMRange");
var Un = Object.freeze({ __proto__: null, Attachment: Wi, AttachmentManager: Sn, AttachmentPiece: Ui, Block: Gi, Composition: kn, Document: on, Editor: On, HTMLParser: cn, HTMLSanitizer: ui, LineBreakInsertion: Rn, LocationMapper: Fn, ManagedAttachment: En, Piece: _i, PointMapper: jn, SelectionManager: Wn, SplittableList: zi, StringPiece: Vi, Text: Ki, UndoManager: Tn });
var Vn = Object.freeze({ __proto__: null, ObjectView: ie, AttachmentView: gi, BlockView: xi, DocumentView: Ci, PieceView: bi, PreviewableAttachmentView: fi, TextView: vi });
var { lang: zn, css: qn, keyNames: Hn } = z;
var Jn = function(t3) {
  return function() {
    const e2 = t3.apply(this, arguments);
    e2.do(), this.undos || (this.undos = []), this.undos.push(e2.undo);
  };
};
var Kn = class extends q {
  constructor(t3, e2, i2) {
    let n2 = arguments.length > 3 && void 0 !== arguments[3] ? arguments[3] : {};
    super(...arguments), wi(this, "makeElementMutable", Jn(() => ({ do: () => {
      this.element.dataset.trixMutable = true;
    }, undo: () => delete this.element.dataset.trixMutable }))), wi(this, "addToolbar", Jn(() => {
      const t4 = T({ tagName: "div", className: qn.attachmentToolbar, data: { trixMutable: true }, childNodes: T({ tagName: "div", className: "trix-button-row", childNodes: T({ tagName: "span", className: "trix-button-group trix-button-group--actions", childNodes: T({ tagName: "button", className: "trix-button trix-button--remove", textContent: zn.remove, attributes: { title: zn.remove }, data: { trixAction: "remove" } }) }) }) });
      return this.attachment.isPreviewable() && t4.appendChild(T({ tagName: "div", className: qn.attachmentMetadataContainer, childNodes: T({ tagName: "span", className: qn.attachmentMetadata, childNodes: [T({ tagName: "span", className: qn.attachmentName, textContent: this.attachment.getFilename(), attributes: { title: this.attachment.getFilename() } }), T({ tagName: "span", className: qn.attachmentSize, textContent: this.attachment.getFormattedFilesize() })] }) })), b("click", { onElement: t4, withCallback: this.didClickToolbar }), b("click", { onElement: t4, matchingSelector: "[data-trix-action]", withCallback: this.didClickActionButton }), v("trix-attachment-before-toolbar", { onElement: this.element, attributes: { toolbar: t4, attachment: this.attachment } }), { do: () => this.element.appendChild(t4), undo: () => S(t4) };
    })), wi(this, "installCaptionEditor", Jn(() => {
      const t4 = T({ tagName: "textarea", className: qn.attachmentCaptionEditor, attributes: { placeholder: zn.captionPlaceholder }, data: { trixMutable: true } });
      t4.value = this.attachmentPiece.getCaption();
      const e3 = t4.cloneNode();
      e3.classList.add("trix-autoresize-clone"), e3.tabIndex = -1;
      const i3 = function() {
        e3.value = t4.value, t4.style.height = e3.scrollHeight + "px";
      };
      b("input", { onElement: t4, withCallback: i3 }), b("input", { onElement: t4, withCallback: this.didInputCaption }), b("keydown", { onElement: t4, withCallback: this.didKeyDownCaption }), b("change", { onElement: t4, withCallback: this.didChangeCaption }), b("blur", { onElement: t4, withCallback: this.didBlurCaption });
      const n3 = this.element.querySelector("figcaption"), r2 = n3.cloneNode();
      return { do: () => {
        if (n3.style.display = "none", r2.appendChild(t4), r2.appendChild(e3), r2.classList.add("".concat(qn.attachmentCaption, "--editing")), n3.parentElement.insertBefore(r2, n3), i3(), this.options.editCaption) return Rt(() => t4.focus());
      }, undo() {
        S(r2), n3.style.display = null;
      } };
    })), this.didClickToolbar = this.didClickToolbar.bind(this), this.didClickActionButton = this.didClickActionButton.bind(this), this.didKeyDownCaption = this.didKeyDownCaption.bind(this), this.didInputCaption = this.didInputCaption.bind(this), this.didChangeCaption = this.didChangeCaption.bind(this), this.didBlurCaption = this.didBlurCaption.bind(this), this.attachmentPiece = t3, this.element = e2, this.container = i2, this.options = n2, this.attachment = this.attachmentPiece.attachment, "a" === k(this.element) && (this.element = this.element.firstChild), this.install();
  }
  install() {
    this.makeElementMutable(), this.addToolbar(), this.attachment.isPreviewable() && this.installCaptionEditor();
  }
  uninstall() {
    var t3;
    let e2 = this.undos.pop();
    for (this.savePendingCaption(); e2; ) e2(), e2 = this.undos.pop();
    null === (t3 = this.delegate) || void 0 === t3 || t3.didUninstallAttachmentEditor(this);
  }
  savePendingCaption() {
    if (null != this.pendingCaption) {
      const r2 = this.pendingCaption;
      var t3, e2, i2, n2;
      if (this.pendingCaption = null, r2) null === (t3 = this.delegate) || void 0 === t3 || null === (e2 = t3.attachmentEditorDidRequestUpdatingAttributesForAttachment) || void 0 === e2 || e2.call(t3, { caption: r2 }, this.attachment);
      else null === (i2 = this.delegate) || void 0 === i2 || null === (n2 = i2.attachmentEditorDidRequestRemovingAttributeForAttachment) || void 0 === n2 || n2.call(i2, "caption", this.attachment);
    }
  }
  didClickToolbar(t3) {
    return t3.preventDefault(), t3.stopPropagation();
  }
  didClickActionButton(t3) {
    var e2;
    if ("remove" === t3.target.getAttribute("data-trix-action")) return null === (e2 = this.delegate) || void 0 === e2 ? void 0 : e2.attachmentEditorDidRequestRemovalOfAttachment(this.attachment);
  }
  didKeyDownCaption(t3) {
    var e2, i2;
    if ("return" === Hn[t3.keyCode]) return t3.preventDefault(), this.savePendingCaption(), null === (e2 = this.delegate) || void 0 === e2 || null === (i2 = e2.attachmentEditorDidRequestDeselectingAttachment) || void 0 === i2 ? void 0 : i2.call(e2, this.attachment);
  }
  didInputCaption(t3) {
    this.pendingCaption = t3.target.value.replace(/\s/g, " ").trim();
  }
  didChangeCaption(t3) {
    return this.savePendingCaption();
  }
  didBlurCaption(t3) {
    return this.savePendingCaption();
  }
};
var Gn = class extends q {
  constructor(t3, i2) {
    super(...arguments), this.didFocus = this.didFocus.bind(this), this.didBlur = this.didBlur.bind(this), this.didClickAttachment = this.didClickAttachment.bind(this), this.element = t3, this.composition = i2, this.documentView = new Ci(this.composition.document, { element: this.element }), b("focus", { onElement: this.element, withCallback: this.didFocus }), b("blur", { onElement: this.element, withCallback: this.didBlur }), b("click", { onElement: this.element, matchingSelector: "a[contenteditable=false]", preventDefault: true }), b("mousedown", { onElement: this.element, matchingSelector: e, withCallback: this.didClickAttachment }), b("click", { onElement: this.element, matchingSelector: "a".concat(e), preventDefault: true });
  }
  didFocus(t3) {
    var e2;
    const i2 = () => {
      var t4, e3;
      if (!this.focused) return this.focused = true, null === (t4 = this.delegate) || void 0 === t4 || null === (e3 = t4.compositionControllerDidFocus) || void 0 === e3 ? void 0 : e3.call(t4);
    };
    return (null === (e2 = this.blurPromise) || void 0 === e2 ? void 0 : e2.then(i2)) || i2();
  }
  didBlur(t3) {
    this.blurPromise = new Promise((t4) => Rt(() => {
      var e2, i2;
      x(this.element) || (this.focused = null, null === (e2 = this.delegate) || void 0 === e2 || null === (i2 = e2.compositionControllerDidBlur) || void 0 === i2 || i2.call(e2));
      return this.blurPromise = null, t4();
    }));
  }
  didClickAttachment(t3, e2) {
    var i2, n2;
    const r2 = this.findAttachmentForElement(e2), o2 = !!y(t3.target, { matchingSelector: "figcaption" });
    return null === (i2 = this.delegate) || void 0 === i2 || null === (n2 = i2.compositionControllerDidSelectAttachment) || void 0 === n2 ? void 0 : n2.call(i2, r2, { editCaption: o2 });
  }
  getSerializableElement() {
    return this.isEditingAttachment() ? this.documentView.shadowElement : this.element;
  }
  render() {
    var t3, e2, i2, n2, r2, o2;
    (this.revision !== this.composition.revision && (this.documentView.setDocument(this.composition.document), this.documentView.render(), this.revision = this.composition.revision), this.canSyncDocumentView() && !this.documentView.isSynced()) && (null === (i2 = this.delegate) || void 0 === i2 || null === (n2 = i2.compositionControllerWillSyncDocumentView) || void 0 === n2 || n2.call(i2), this.documentView.sync(), null === (r2 = this.delegate) || void 0 === r2 || null === (o2 = r2.compositionControllerDidSyncDocumentView) || void 0 === o2 || o2.call(r2));
    return null === (t3 = this.delegate) || void 0 === t3 || null === (e2 = t3.compositionControllerDidRender) || void 0 === e2 ? void 0 : e2.call(t3);
  }
  rerenderViewForObject(t3) {
    return this.invalidateViewForObject(t3), this.render();
  }
  invalidateViewForObject(t3) {
    return this.documentView.invalidateViewForObject(t3);
  }
  isViewCachingEnabled() {
    return this.documentView.isViewCachingEnabled();
  }
  enableViewCaching() {
    return this.documentView.enableViewCaching();
  }
  disableViewCaching() {
    return this.documentView.disableViewCaching();
  }
  refreshViewCache() {
    return this.documentView.garbageCollectCachedViews();
  }
  isEditingAttachment() {
    return !!this.attachmentEditor;
  }
  installAttachmentEditorForAttachment(t3, e2) {
    var i2;
    if ((null === (i2 = this.attachmentEditor) || void 0 === i2 ? void 0 : i2.attachment) === t3) return;
    const n2 = this.documentView.findElementForObject(t3);
    if (!n2) return;
    this.uninstallAttachmentEditor();
    const r2 = this.composition.document.getAttachmentPieceForAttachment(t3);
    this.attachmentEditor = new Kn(r2, n2, this.element, e2), this.attachmentEditor.delegate = this;
  }
  uninstallAttachmentEditor() {
    var t3;
    return null === (t3 = this.attachmentEditor) || void 0 === t3 ? void 0 : t3.uninstall();
  }
  didUninstallAttachmentEditor() {
    return this.attachmentEditor = null, this.render();
  }
  attachmentEditorDidRequestUpdatingAttributesForAttachment(t3, e2) {
    var i2, n2;
    return null === (i2 = this.delegate) || void 0 === i2 || null === (n2 = i2.compositionControllerWillUpdateAttachment) || void 0 === n2 || n2.call(i2, e2), this.composition.updateAttributesForAttachment(t3, e2);
  }
  attachmentEditorDidRequestRemovingAttributeForAttachment(t3, e2) {
    var i2, n2;
    return null === (i2 = this.delegate) || void 0 === i2 || null === (n2 = i2.compositionControllerWillUpdateAttachment) || void 0 === n2 || n2.call(i2, e2), this.composition.removeAttributeForAttachment(t3, e2);
  }
  attachmentEditorDidRequestRemovalOfAttachment(t3) {
    var e2, i2;
    return null === (e2 = this.delegate) || void 0 === e2 || null === (i2 = e2.compositionControllerDidRequestRemovalOfAttachment) || void 0 === i2 ? void 0 : i2.call(e2, t3);
  }
  attachmentEditorDidRequestDeselectingAttachment(t3) {
    var e2, i2;
    return null === (e2 = this.delegate) || void 0 === e2 || null === (i2 = e2.compositionControllerDidRequestDeselectingAttachment) || void 0 === i2 ? void 0 : i2.call(e2, t3);
  }
  canSyncDocumentView() {
    return !this.isEditingAttachment();
  }
  findAttachmentForElement(t3) {
    return this.composition.document.getAttachmentById(parseInt(t3.dataset.trixId, 10));
  }
};
var Yn = class extends q {
};
var $n = "data-trix-mutable";
var Xn = "[".concat($n, "]");
var Zn = { attributes: true, childList: true, characterData: true, characterDataOldValue: true, subtree: true };
var Qn = class extends q {
  constructor(t3) {
    super(t3), this.didMutate = this.didMutate.bind(this), this.element = t3, this.observer = new window.MutationObserver(this.didMutate), this.start();
  }
  start() {
    return this.reset(), this.observer.observe(this.element, Zn);
  }
  stop() {
    return this.observer.disconnect();
  }
  didMutate(t3) {
    var e2, i2;
    if (this.mutations.push(...Array.from(this.findSignificantMutations(t3) || [])), this.mutations.length) return null === (e2 = this.delegate) || void 0 === e2 || null === (i2 = e2.elementDidMutate) || void 0 === i2 || i2.call(e2, this.getMutationSummary()), this.reset();
  }
  reset() {
    this.mutations = [];
  }
  findSignificantMutations(t3) {
    return t3.filter((t4) => this.mutationIsSignificant(t4));
  }
  mutationIsSignificant(t3) {
    if (this.nodeIsMutable(t3.target)) return false;
    for (const e2 of Array.from(this.nodesModifiedByMutation(t3))) if (this.nodeIsSignificant(e2)) return true;
    return false;
  }
  nodeIsSignificant(t3) {
    return t3 !== this.element && !this.nodeIsMutable(t3) && !M(t3);
  }
  nodeIsMutable(t3) {
    return y(t3, { matchingSelector: Xn });
  }
  nodesModifiedByMutation(t3) {
    const e2 = [];
    switch (t3.type) {
      case "attributes":
        t3.attributeName !== $n && e2.push(t3.target);
        break;
      case "characterData":
        e2.push(t3.target.parentNode), e2.push(t3.target);
        break;
      case "childList":
        e2.push(...Array.from(t3.addedNodes || [])), e2.push(...Array.from(t3.removedNodes || []));
    }
    return e2;
  }
  getMutationSummary() {
    return this.getTextMutationSummary();
  }
  getTextMutationSummary() {
    const { additions: t3, deletions: e2 } = this.getTextChangesFromCharacterData(), i2 = this.getTextChangesFromChildList();
    Array.from(i2.additions).forEach((e3) => {
      Array.from(t3).includes(e3) || t3.push(e3);
    }), e2.push(...Array.from(i2.deletions || []));
    const n2 = {}, r2 = t3.join("");
    r2 && (n2.textAdded = r2);
    const o2 = e2.join("");
    return o2 && (n2.textDeleted = o2), n2;
  }
  getMutationsByType(t3) {
    return Array.from(this.mutations).filter((e2) => e2.type === t3);
  }
  getTextChangesFromChildList() {
    let t3, e2;
    const i2 = [], n2 = [];
    Array.from(this.getMutationsByType("childList")).forEach((t4) => {
      i2.push(...Array.from(t4.addedNodes || [])), n2.push(...Array.from(t4.removedNodes || []));
    });
    0 === i2.length && 1 === n2.length && I(n2[0]) ? (t3 = [], e2 = ["\n"]) : (t3 = tr(i2), e2 = tr(n2));
    const r2 = t3.filter((t4, i3) => t4 !== e2[i3]).map(Wt), o2 = e2.filter((e3, i3) => e3 !== t3[i3]).map(Wt);
    return { additions: r2, deletions: o2 };
  }
  getTextChangesFromCharacterData() {
    let t3, e2;
    const i2 = this.getMutationsByType("characterData");
    if (i2.length) {
      const n2 = i2[0], r2 = i2[i2.length - 1], o2 = function(t4, e3) {
        let i3, n3;
        return t4 = X.box(t4), (e3 = X.box(e3)).length < t4.length ? [n3, i3] = zt(t4, e3) : [i3, n3] = zt(e3, t4), { added: i3, removed: n3 };
      }(Wt(n2.oldValue), Wt(r2.target.data));
      t3 = o2.added, e2 = o2.removed;
    }
    return { additions: t3 ? [t3] : [], deletions: e2 ? [e2] : [] };
  }
};
var tr = function() {
  let t3 = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : [];
  const e2 = [];
  for (const i2 of Array.from(t3)) switch (i2.nodeType) {
    case Node.TEXT_NODE:
      e2.push(i2.data);
      break;
    case Node.ELEMENT_NODE:
      "br" === k(i2) ? e2.push("\n") : e2.push(...Array.from(tr(i2.childNodes) || []));
  }
  return e2;
};
var er = class extends ee {
  constructor(t3) {
    super(...arguments), this.file = t3;
  }
  perform(t3) {
    const e2 = new FileReader();
    return e2.onerror = () => t3(false), e2.onload = () => {
      e2.onerror = null;
      try {
        e2.abort();
      } catch (t4) {
      }
      return t3(true, this.file);
    }, e2.readAsArrayBuffer(this.file);
  }
};
var ir = class {
  constructor(t3) {
    this.element = t3;
  }
  shouldIgnore(t3) {
    return !!a.samsungAndroid && (this.previousEvent = this.event, this.event = t3, this.checkSamsungKeyboardBuggyModeStart(), this.checkSamsungKeyboardBuggyModeEnd(), this.buggyMode);
  }
  checkSamsungKeyboardBuggyModeStart() {
    this.insertingLongTextAfterUnidentifiedChar() && nr(this.element.innerText, this.event.data) && (this.buggyMode = true, this.event.preventDefault());
  }
  checkSamsungKeyboardBuggyModeEnd() {
    this.buggyMode && "insertText" !== this.event.inputType && (this.buggyMode = false);
  }
  insertingLongTextAfterUnidentifiedChar() {
    var t3;
    return this.isBeforeInputInsertText() && this.previousEventWasUnidentifiedKeydown() && (null === (t3 = this.event.data) || void 0 === t3 ? void 0 : t3.length) > 50;
  }
  isBeforeInputInsertText() {
    return "beforeinput" === this.event.type && "insertText" === this.event.inputType;
  }
  previousEventWasUnidentifiedKeydown() {
    var t3, e2;
    return "keydown" === (null === (t3 = this.previousEvent) || void 0 === t3 ? void 0 : t3.type) && "Unidentified" === (null === (e2 = this.previousEvent) || void 0 === e2 ? void 0 : e2.key);
  }
};
var nr = (t3, e2) => or(t3) === or(e2);
var rr = new RegExp("(".concat("\uFFFC", "|").concat(d, "|").concat(g, "|\\s)+"), "g");
var or = (t3) => t3.replace(rr, " ").trim();
var sr = class extends q {
  constructor(t3) {
    super(...arguments), this.element = t3, this.mutationObserver = new Qn(this.element), this.mutationObserver.delegate = this, this.flakyKeyboardDetector = new ir(this.element);
    for (const t4 in this.constructor.events) b(t4, { onElement: this.element, withCallback: this.handlerFor(t4) });
  }
  elementDidMutate(t3) {
  }
  editorWillSyncDocumentView() {
    return this.mutationObserver.stop();
  }
  editorDidSyncDocumentView() {
    return this.mutationObserver.start();
  }
  requestRender() {
    var t3, e2;
    return null === (t3 = this.delegate) || void 0 === t3 || null === (e2 = t3.inputControllerDidRequestRender) || void 0 === e2 ? void 0 : e2.call(t3);
  }
  requestReparse() {
    var t3, e2;
    return null === (t3 = this.delegate) || void 0 === t3 || null === (e2 = t3.inputControllerDidRequestReparse) || void 0 === e2 || e2.call(t3), this.requestRender();
  }
  attachFiles(t3) {
    const e2 = Array.from(t3).map((t4) => new er(t4));
    return Promise.all(e2).then((t4) => {
      this.handleInput(function() {
        var e3, i2;
        return null === (e3 = this.delegate) || void 0 === e3 || e3.inputControllerWillAttachFiles(), null === (i2 = this.responder) || void 0 === i2 || i2.insertFiles(t4), this.requestRender();
      });
    });
  }
  handlerFor(t3) {
    return (e2) => {
      e2.defaultPrevented || this.handleInput(() => {
        if (!x(this.element)) {
          if (this.flakyKeyboardDetector.shouldIgnore(e2)) return;
          this.eventName = t3, this.constructor.events[t3].call(this, e2);
        }
      });
    };
  }
  handleInput(t3) {
    try {
      var e2;
      null === (e2 = this.delegate) || void 0 === e2 || e2.inputControllerWillHandleInput(), t3.call(this);
    } finally {
      var i2;
      null === (i2 = this.delegate) || void 0 === i2 || i2.inputControllerDidHandleInput();
    }
  }
  createLinkHTML(t3, e2) {
    const i2 = document.createElement("a");
    return i2.href = t3, i2.textContent = e2 || t3, i2.outerHTML;
  }
};
var ar;
wi(sr, "events", {});
var { browser: lr, keyNames: cr } = z;
var ur = 0;
var hr = class extends sr {
  constructor() {
    super(...arguments), this.resetInputSummary();
  }
  setInputSummary() {
    let t3 = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {};
    this.inputSummary.eventName = this.eventName;
    for (const e2 in t3) {
      const i2 = t3[e2];
      this.inputSummary[e2] = i2;
    }
    return this.inputSummary;
  }
  resetInputSummary() {
    this.inputSummary = {};
  }
  reset() {
    return this.resetInputSummary(), Ft.reset();
  }
  elementDidMutate(t3) {
    var e2, i2;
    return this.isComposing() ? null === (e2 = this.delegate) || void 0 === e2 || null === (i2 = e2.inputControllerDidAllowUnhandledInput) || void 0 === i2 ? void 0 : i2.call(e2) : this.handleInput(function() {
      return this.mutationIsSignificant(t3) && (this.mutationIsExpected(t3) ? this.requestRender() : this.requestReparse()), this.reset();
    });
  }
  mutationIsExpected(t3) {
    let { textAdded: e2, textDeleted: i2 } = t3;
    if (this.inputSummary.preferDocument) return true;
    const n2 = null != e2 ? e2 === this.inputSummary.textAdded : !this.inputSummary.textAdded, r2 = null != i2 ? this.inputSummary.didDelete : !this.inputSummary.didDelete, o2 = ["\n", " \n"].includes(e2) && !n2, s2 = "\n" === i2 && !r2;
    if (o2 && !s2 || s2 && !o2) {
      const t4 = this.getSelectedRange();
      if (t4) {
        var a2;
        const i3 = o2 ? e2.replace(/\n$/, "").length || -1 : (null == e2 ? void 0 : e2.length) || 1;
        if (null !== (a2 = this.responder) && void 0 !== a2 && a2.positionIsBlockBreak(t4[1] + i3)) return true;
      }
    }
    return n2 && r2;
  }
  mutationIsSignificant(t3) {
    var e2;
    const i2 = Object.keys(t3).length > 0, n2 = "" === (null === (e2 = this.compositionInput) || void 0 === e2 ? void 0 : e2.getEndData());
    return i2 || !n2;
  }
  getCompositionInput() {
    if (this.isComposing()) return this.compositionInput;
    this.compositionInput = new fr(this);
  }
  isComposing() {
    return this.compositionInput && !this.compositionInput.isEnded();
  }
  deleteInDirection(t3, e2) {
    var i2;
    return false !== (null === (i2 = this.responder) || void 0 === i2 ? void 0 : i2.deleteInDirection(t3)) ? this.setInputSummary({ didDelete: true }) : e2 ? (e2.preventDefault(), this.requestRender()) : void 0;
  }
  serializeSelectionToDataTransfer(t3) {
    var e2;
    if (!function(t4) {
      if (null == t4 || !t4.setData) return false;
      for (const e3 in Ct) {
        const i3 = Ct[e3];
        try {
          if (t4.setData(e3, i3), !t4.getData(e3) === i3) return false;
        } catch (t5) {
          return false;
        }
      }
      return true;
    }(t3)) return;
    const i2 = null === (e2 = this.responder) || void 0 === e2 ? void 0 : e2.getSelectedDocument().toSerializableDocument();
    return t3.setData("application/x-trix-document", JSON.stringify(i2)), t3.setData("text/html", Ci.render(i2).innerHTML), t3.setData("text/plain", i2.toString().replace(/\n$/, "")), true;
  }
  canAcceptDataTransfer(t3) {
    const e2 = {};
    return Array.from((null == t3 ? void 0 : t3.types) || []).forEach((t4) => {
      e2[t4] = true;
    }), e2.Files || e2["application/x-trix-document"] || e2["text/html"] || e2["text/plain"];
  }
  getPastedHTMLUsingHiddenElement(t3) {
    const e2 = this.getSelectedRange(), i2 = { position: "absolute", left: "".concat(window.pageXOffset, "px"), top: "".concat(window.pageYOffset, "px"), opacity: 0 }, n2 = T({ style: i2, tagName: "div", editable: true });
    return document.body.appendChild(n2), n2.focus(), requestAnimationFrame(() => {
      const i3 = n2.innerHTML;
      return S(n2), this.setSelectedRange(e2), t3(i3);
    });
  }
};
wi(hr, "events", { keydown(t3) {
  this.isComposing() || this.resetInputSummary(), this.inputSummary.didInput = true;
  const e2 = cr[t3.keyCode];
  if (e2) {
    var i2;
    let n3 = this.keys;
    ["ctrl", "alt", "shift", "meta"].forEach((e3) => {
      var i3;
      t3["".concat(e3, "Key")] && ("ctrl" === e3 && (e3 = "control"), n3 = null === (i3 = n3) || void 0 === i3 ? void 0 : i3[e3]);
    }), null != (null === (i2 = n3) || void 0 === i2 ? void 0 : i2[e2]) && (this.setInputSummary({ keyName: e2 }), Ft.reset(), n3[e2].call(this, t3));
  }
  if (St(t3)) {
    const e3 = String.fromCharCode(t3.keyCode).toLowerCase();
    if (e3) {
      var n2;
      const i3 = ["alt", "shift"].map((e4) => {
        if (t3["".concat(e4, "Key")]) return e4;
      }).filter((t4) => t4);
      i3.push(e3), null !== (n2 = this.delegate) && void 0 !== n2 && n2.inputControllerDidReceiveKeyboardCommand(i3) && t3.preventDefault();
    }
  }
}, keypress(t3) {
  if (null != this.inputSummary.eventName) return;
  if (t3.metaKey) return;
  if (t3.ctrlKey && !t3.altKey) return;
  const e2 = mr(t3);
  var i2, n2;
  return e2 ? (null === (i2 = this.delegate) || void 0 === i2 || i2.inputControllerWillPerformTyping(), null === (n2 = this.responder) || void 0 === n2 || n2.insertString(e2), this.setInputSummary({ textAdded: e2, didDelete: this.selectionIsExpanded() })) : void 0;
}, textInput(t3) {
  const { data: e2 } = t3, { textAdded: i2 } = this.inputSummary;
  if (i2 && i2 !== e2 && i2.toUpperCase() === e2) {
    var n2;
    const t4 = this.getSelectedRange();
    return this.setSelectedRange([t4[0], t4[1] + i2.length]), null === (n2 = this.responder) || void 0 === n2 || n2.insertString(e2), this.setInputSummary({ textAdded: e2 }), this.setSelectedRange(t4);
  }
}, dragenter(t3) {
  t3.preventDefault();
}, dragstart(t3) {
  var e2, i2;
  return this.serializeSelectionToDataTransfer(t3.dataTransfer), this.draggedRange = this.getSelectedRange(), null === (e2 = this.delegate) || void 0 === e2 || null === (i2 = e2.inputControllerDidStartDrag) || void 0 === i2 ? void 0 : i2.call(e2);
}, dragover(t3) {
  if (this.draggedRange || this.canAcceptDataTransfer(t3.dataTransfer)) {
    t3.preventDefault();
    const n2 = { x: t3.clientX, y: t3.clientY };
    var e2, i2;
    if (!Tt(n2, this.draggingPoint)) return this.draggingPoint = n2, null === (e2 = this.delegate) || void 0 === e2 || null === (i2 = e2.inputControllerDidReceiveDragOverPoint) || void 0 === i2 ? void 0 : i2.call(e2, this.draggingPoint);
  }
}, dragend(t3) {
  var e2, i2;
  null === (e2 = this.delegate) || void 0 === e2 || null === (i2 = e2.inputControllerDidCancelDrag) || void 0 === i2 || i2.call(e2), this.draggedRange = null, this.draggingPoint = null;
}, drop(t3) {
  var e2, i2;
  t3.preventDefault();
  const n2 = null === (e2 = t3.dataTransfer) || void 0 === e2 ? void 0 : e2.files, r2 = t3.dataTransfer.getData("application/x-trix-document"), o2 = { x: t3.clientX, y: t3.clientY };
  if (null === (i2 = this.responder) || void 0 === i2 || i2.setLocationRangeFromPointRange(o2), null != n2 && n2.length) this.attachFiles(n2);
  else if (this.draggedRange) {
    var s2, a2;
    null === (s2 = this.delegate) || void 0 === s2 || s2.inputControllerWillMoveText(), null === (a2 = this.responder) || void 0 === a2 || a2.moveTextFromRange(this.draggedRange), this.draggedRange = null, this.requestRender();
  } else if (r2) {
    var l2;
    const t4 = on.fromJSONString(r2);
    null === (l2 = this.responder) || void 0 === l2 || l2.insertDocument(t4), this.requestRender();
  }
  this.draggedRange = null, this.draggingPoint = null;
}, cut(t3) {
  var e2, i2;
  if (null !== (e2 = this.responder) && void 0 !== e2 && e2.selectionIsExpanded() && (this.serializeSelectionToDataTransfer(t3.clipboardData) && t3.preventDefault(), null === (i2 = this.delegate) || void 0 === i2 || i2.inputControllerWillCutText(), this.deleteInDirection("backward"), t3.defaultPrevented)) return this.requestRender();
}, copy(t3) {
  var e2;
  null !== (e2 = this.responder) && void 0 !== e2 && e2.selectionIsExpanded() && this.serializeSelectionToDataTransfer(t3.clipboardData) && t3.preventDefault();
}, paste(t3) {
  const e2 = t3.clipboardData || t3.testClipboardData, i2 = { clipboard: e2 };
  if (!e2 || pr(t3)) return void this.getPastedHTMLUsingHiddenElement((t4) => {
    var e3, n3, r3;
    return i2.type = "text/html", i2.html = t4, null === (e3 = this.delegate) || void 0 === e3 || e3.inputControllerWillPaste(i2), null === (n3 = this.responder) || void 0 === n3 || n3.insertHTML(i2.html), this.requestRender(), null === (r3 = this.delegate) || void 0 === r3 ? void 0 : r3.inputControllerDidPaste(i2);
  });
  const n2 = e2.getData("URL"), r2 = e2.getData("text/html"), o2 = e2.getData("public.url-name");
  if (n2) {
    var s2, a2, l2;
    let t4;
    i2.type = "text/html", t4 = o2 ? Vt(o2).trim() : n2, i2.html = this.createLinkHTML(n2, t4), null === (s2 = this.delegate) || void 0 === s2 || s2.inputControllerWillPaste(i2), this.setInputSummary({ textAdded: t4, didDelete: this.selectionIsExpanded() }), null === (a2 = this.responder) || void 0 === a2 || a2.insertHTML(i2.html), this.requestRender(), null === (l2 = this.delegate) || void 0 === l2 || l2.inputControllerDidPaste(i2);
  } else if (Et(e2)) {
    var c2, u2, h2;
    i2.type = "text/plain", i2.string = e2.getData("text/plain"), null === (c2 = this.delegate) || void 0 === c2 || c2.inputControllerWillPaste(i2), this.setInputSummary({ textAdded: i2.string, didDelete: this.selectionIsExpanded() }), null === (u2 = this.responder) || void 0 === u2 || u2.insertString(i2.string), this.requestRender(), null === (h2 = this.delegate) || void 0 === h2 || h2.inputControllerDidPaste(i2);
  } else if (r2) {
    var d2, g2, m2;
    i2.type = "text/html", i2.html = r2, null === (d2 = this.delegate) || void 0 === d2 || d2.inputControllerWillPaste(i2), null === (g2 = this.responder) || void 0 === g2 || g2.insertHTML(i2.html), this.requestRender(), null === (m2 = this.delegate) || void 0 === m2 || m2.inputControllerDidPaste(i2);
  } else if (Array.from(e2.types).includes("Files")) {
    var p2, f2;
    const t4 = null === (p2 = e2.items) || void 0 === p2 || null === (p2 = p2[0]) || void 0 === p2 || null === (f2 = p2.getAsFile) || void 0 === f2 ? void 0 : f2.call(p2);
    if (t4) {
      var b2, v2, A2;
      const e3 = dr(t4);
      !t4.name && e3 && (t4.name = "pasted-file-".concat(++ur, ".").concat(e3)), i2.type = "File", i2.file = t4, null === (b2 = this.delegate) || void 0 === b2 || b2.inputControllerWillAttachFiles(), null === (v2 = this.responder) || void 0 === v2 || v2.insertFile(i2.file), this.requestRender(), null === (A2 = this.delegate) || void 0 === A2 || A2.inputControllerDidPaste(i2);
    }
  }
  t3.preventDefault();
}, compositionstart(t3) {
  return this.getCompositionInput().start(t3.data);
}, compositionupdate(t3) {
  return this.getCompositionInput().update(t3.data);
}, compositionend(t3) {
  return this.getCompositionInput().end(t3.data);
}, beforeinput(t3) {
  this.inputSummary.didInput = true;
}, input(t3) {
  return this.inputSummary.didInput = true, t3.stopPropagation();
} }), wi(hr, "keys", { backspace(t3) {
  var e2;
  return null === (e2 = this.delegate) || void 0 === e2 || e2.inputControllerWillPerformTyping(), this.deleteInDirection("backward", t3);
}, delete(t3) {
  var e2;
  return null === (e2 = this.delegate) || void 0 === e2 || e2.inputControllerWillPerformTyping(), this.deleteInDirection("forward", t3);
}, return(t3) {
  var e2, i2;
  return this.setInputSummary({ preferDocument: true }), null === (e2 = this.delegate) || void 0 === e2 || e2.inputControllerWillPerformTyping(), null === (i2 = this.responder) || void 0 === i2 ? void 0 : i2.insertLineBreak();
}, tab(t3) {
  var e2, i2;
  null !== (e2 = this.responder) && void 0 !== e2 && e2.canIncreaseNestingLevel() && (null === (i2 = this.responder) || void 0 === i2 || i2.increaseNestingLevel(), this.requestRender(), t3.preventDefault());
}, left(t3) {
  var e2;
  if (this.selectionIsInCursorTarget()) return t3.preventDefault(), null === (e2 = this.responder) || void 0 === e2 ? void 0 : e2.moveCursorInDirection("backward");
}, right(t3) {
  var e2;
  if (this.selectionIsInCursorTarget()) return t3.preventDefault(), null === (e2 = this.responder) || void 0 === e2 ? void 0 : e2.moveCursorInDirection("forward");
}, control: { d(t3) {
  var e2;
  return null === (e2 = this.delegate) || void 0 === e2 || e2.inputControllerWillPerformTyping(), this.deleteInDirection("forward", t3);
}, h(t3) {
  var e2;
  return null === (e2 = this.delegate) || void 0 === e2 || e2.inputControllerWillPerformTyping(), this.deleteInDirection("backward", t3);
}, o(t3) {
  var e2, i2;
  return t3.preventDefault(), null === (e2 = this.delegate) || void 0 === e2 || e2.inputControllerWillPerformTyping(), null === (i2 = this.responder) || void 0 === i2 || i2.insertString("\n", { updatePosition: false }), this.requestRender();
} }, shift: { return(t3) {
  var e2, i2;
  null === (e2 = this.delegate) || void 0 === e2 || e2.inputControllerWillPerformTyping(), null === (i2 = this.responder) || void 0 === i2 || i2.insertString("\n"), this.requestRender(), t3.preventDefault();
}, tab(t3) {
  var e2, i2;
  null !== (e2 = this.responder) && void 0 !== e2 && e2.canDecreaseNestingLevel() && (null === (i2 = this.responder) || void 0 === i2 || i2.decreaseNestingLevel(), this.requestRender(), t3.preventDefault());
}, left(t3) {
  if (this.selectionIsInCursorTarget()) return t3.preventDefault(), this.expandSelectionInDirection("backward");
}, right(t3) {
  if (this.selectionIsInCursorTarget()) return t3.preventDefault(), this.expandSelectionInDirection("forward");
} }, alt: { backspace(t3) {
  var e2;
  return this.setInputSummary({ preferDocument: false }), null === (e2 = this.delegate) || void 0 === e2 ? void 0 : e2.inputControllerWillPerformTyping();
} }, meta: { backspace(t3) {
  var e2;
  return this.setInputSummary({ preferDocument: false }), null === (e2 = this.delegate) || void 0 === e2 ? void 0 : e2.inputControllerWillPerformTyping();
} } }), hr.proxyMethod("responder?.getSelectedRange"), hr.proxyMethod("responder?.setSelectedRange"), hr.proxyMethod("responder?.expandSelectionInDirection"), hr.proxyMethod("responder?.selectionIsInCursorTarget"), hr.proxyMethod("responder?.selectionIsExpanded");
var dr = (t3) => {
  var e2;
  return null === (e2 = t3.type) || void 0 === e2 || null === (e2 = e2.match(/\/(\w+)$/)) || void 0 === e2 ? void 0 : e2[1];
};
var gr = !(null === (ar = " ".codePointAt) || void 0 === ar || !ar.call(" ", 0));
var mr = function(t3) {
  if (t3.key && gr && t3.key.codePointAt(0) === t3.keyCode) return t3.key;
  {
    let e2;
    if (null === t3.which ? e2 = t3.keyCode : 0 !== t3.which && 0 !== t3.charCode && (e2 = t3.charCode), null != e2 && "escape" !== cr[e2]) return X.fromCodepoints([e2]).toString();
  }
};
var pr = function(t3) {
  const e2 = t3.clipboardData;
  if (e2) {
    if (e2.types.includes("text/html")) {
      for (const t4 of e2.types) {
        const i2 = /^CorePasteboardFlavorType/.test(t4), n2 = /^dyn\./.test(t4) && e2.getData(t4);
        if (i2 || n2) return true;
      }
      return false;
    }
    {
      const t4 = e2.types.includes("com.apple.webarchive"), i2 = e2.types.includes("com.apple.flat-rtfd");
      return t4 || i2;
    }
  }
};
var fr = class extends q {
  constructor(t3) {
    super(...arguments), this.inputController = t3, this.responder = this.inputController.responder, this.delegate = this.inputController.delegate, this.inputSummary = this.inputController.inputSummary, this.data = {};
  }
  start(t3) {
    if (this.data.start = t3, this.isSignificant()) {
      var e2, i2;
      if ("keypress" === this.inputSummary.eventName && this.inputSummary.textAdded) null === (i2 = this.responder) || void 0 === i2 || i2.deleteInDirection("left");
      this.selectionIsExpanded() || (this.insertPlaceholder(), this.requestRender()), this.range = null === (e2 = this.responder) || void 0 === e2 ? void 0 : e2.getSelectedRange();
    }
  }
  update(t3) {
    if (this.data.update = t3, this.isSignificant()) {
      const t4 = this.selectPlaceholder();
      t4 && (this.forgetPlaceholder(), this.range = t4);
    }
  }
  end(t3) {
    return this.data.end = t3, this.isSignificant() ? (this.forgetPlaceholder(), this.canApplyToDocument() ? (this.setInputSummary({ preferDocument: true, didInput: false }), null === (e2 = this.delegate) || void 0 === e2 || e2.inputControllerWillPerformTyping(), null === (i2 = this.responder) || void 0 === i2 || i2.setSelectedRange(this.range), null === (n2 = this.responder) || void 0 === n2 || n2.insertString(this.data.end), null === (r2 = this.responder) || void 0 === r2 ? void 0 : r2.setSelectedRange(this.range[0] + this.data.end.length)) : null != this.data.start || null != this.data.update ? (this.requestReparse(), this.inputController.reset()) : void 0) : this.inputController.reset();
    var e2, i2, n2, r2;
  }
  getEndData() {
    return this.data.end;
  }
  isEnded() {
    return null != this.getEndData();
  }
  isSignificant() {
    return !lr.composesExistingText || this.inputSummary.didInput;
  }
  canApplyToDocument() {
    var t3, e2;
    return 0 === (null === (t3 = this.data.start) || void 0 === t3 ? void 0 : t3.length) && (null === (e2 = this.data.end) || void 0 === e2 ? void 0 : e2.length) > 0 && this.range;
  }
};
fr.proxyMethod("inputController.setInputSummary"), fr.proxyMethod("inputController.requestRender"), fr.proxyMethod("inputController.requestReparse"), fr.proxyMethod("responder?.selectionIsExpanded"), fr.proxyMethod("responder?.insertPlaceholder"), fr.proxyMethod("responder?.selectPlaceholder"), fr.proxyMethod("responder?.forgetPlaceholder");
var br = class extends sr {
  constructor() {
    super(...arguments), this.render = this.render.bind(this);
  }
  elementDidMutate() {
    return this.scheduledRender ? this.composing ? null === (t3 = this.delegate) || void 0 === t3 || null === (e2 = t3.inputControllerDidAllowUnhandledInput) || void 0 === e2 ? void 0 : e2.call(t3) : void 0 : this.reparse();
    var t3, e2;
  }
  scheduleRender() {
    return this.scheduledRender ? this.scheduledRender : this.scheduledRender = requestAnimationFrame(this.render);
  }
  render() {
    var t3, e2;
    (cancelAnimationFrame(this.scheduledRender), this.scheduledRender = null, this.composing) || (null === (e2 = this.delegate) || void 0 === e2 || e2.render());
    null === (t3 = this.afterRender) || void 0 === t3 || t3.call(this), this.afterRender = null;
  }
  reparse() {
    var t3;
    return null === (t3 = this.delegate) || void 0 === t3 ? void 0 : t3.reparse();
  }
  insertString() {
    var t3;
    let e2 = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : "", i2 = arguments.length > 1 ? arguments[1] : void 0;
    return null === (t3 = this.delegate) || void 0 === t3 || t3.inputControllerWillPerformTyping(), this.withTargetDOMRange(function() {
      var t4;
      return null === (t4 = this.responder) || void 0 === t4 ? void 0 : t4.insertString(e2, i2);
    });
  }
  toggleAttributeIfSupported(t3) {
    var e2;
    if (gt().includes(t3)) return null === (e2 = this.delegate) || void 0 === e2 || e2.inputControllerWillPerformFormatting(t3), this.withTargetDOMRange(function() {
      var e3;
      return null === (e3 = this.responder) || void 0 === e3 ? void 0 : e3.toggleCurrentAttribute(t3);
    });
  }
  activateAttributeIfSupported(t3, e2) {
    var i2;
    if (gt().includes(t3)) return null === (i2 = this.delegate) || void 0 === i2 || i2.inputControllerWillPerformFormatting(t3), this.withTargetDOMRange(function() {
      var i3;
      return null === (i3 = this.responder) || void 0 === i3 ? void 0 : i3.setCurrentAttribute(t3, e2);
    });
  }
  deleteInDirection(t3) {
    let { recordUndoEntry: e2 } = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : { recordUndoEntry: true };
    var i2;
    e2 && (null === (i2 = this.delegate) || void 0 === i2 || i2.inputControllerWillPerformTyping());
    const n2 = () => {
      var e3;
      return null === (e3 = this.responder) || void 0 === e3 ? void 0 : e3.deleteInDirection(t3);
    }, r2 = this.getTargetDOMRange({ minLength: this.composing ? 1 : 2 });
    return r2 ? this.withTargetDOMRange(r2, n2) : n2();
  }
  withTargetDOMRange(t3, e2) {
    var i2;
    return "function" == typeof t3 && (e2 = t3, t3 = this.getTargetDOMRange()), t3 ? null === (i2 = this.responder) || void 0 === i2 ? void 0 : i2.withTargetDOMRange(t3, e2.bind(this)) : (Ft.reset(), e2.call(this));
  }
  getTargetDOMRange() {
    var t3, e2;
    let { minLength: i2 } = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : { minLength: 0 };
    const n2 = null === (t3 = (e2 = this.event).getTargetRanges) || void 0 === t3 ? void 0 : t3.call(e2);
    if (n2 && n2.length) {
      const t4 = vr(n2[0]);
      if (0 === i2 || t4.toString().length >= i2) return t4;
    }
  }
  withEvent(t3, e2) {
    let i2;
    this.event = t3;
    try {
      i2 = e2.call(this);
    } finally {
      this.event = null;
    }
    return i2;
  }
};
wi(br, "events", { keydown(t3) {
  if (St(t3)) {
    var e2;
    const i2 = Er(t3);
    null !== (e2 = this.delegate) && void 0 !== e2 && e2.inputControllerDidReceiveKeyboardCommand(i2) && t3.preventDefault();
  } else {
    let e3 = t3.key;
    t3.altKey && (e3 += "+Alt"), t3.shiftKey && (e3 += "+Shift");
    const i2 = this.constructor.keys[e3];
    if (i2) return this.withEvent(t3, i2);
  }
}, paste(t3) {
  var e2;
  let i2;
  const n2 = null === (e2 = t3.clipboardData) || void 0 === e2 ? void 0 : e2.getData("URL");
  return xr(t3) ? (t3.preventDefault(), this.attachFiles(t3.clipboardData.files)) : Cr(t3) ? (t3.preventDefault(), i2 = { type: "text/plain", string: t3.clipboardData.getData("text/plain") }, null === (r2 = this.delegate) || void 0 === r2 || r2.inputControllerWillPaste(i2), null === (o2 = this.responder) || void 0 === o2 || o2.insertString(i2.string), this.render(), null === (s2 = this.delegate) || void 0 === s2 ? void 0 : s2.inputControllerDidPaste(i2)) : n2 ? (t3.preventDefault(), i2 = { type: "text/html", html: this.createLinkHTML(n2) }, null === (a2 = this.delegate) || void 0 === a2 || a2.inputControllerWillPaste(i2), null === (l2 = this.responder) || void 0 === l2 || l2.insertHTML(i2.html), this.render(), null === (c2 = this.delegate) || void 0 === c2 ? void 0 : c2.inputControllerDidPaste(i2)) : void 0;
  var r2, o2, s2, a2, l2, c2;
}, beforeinput(t3) {
  const e2 = this.constructor.inputTypes[t3.inputType], i2 = (n2 = t3, !(!/iPhone|iPad/.test(navigator.userAgent) || n2.inputType && "insertParagraph" !== n2.inputType));
  var n2;
  e2 && (this.withEvent(t3, e2), i2 || this.scheduleRender()), i2 && this.render();
}, input(t3) {
  Ft.reset();
}, dragstart(t3) {
  var e2, i2;
  null !== (e2 = this.responder) && void 0 !== e2 && e2.selectionContainsAttachments() && (t3.dataTransfer.setData("application/x-trix-dragging", true), this.dragging = { range: null === (i2 = this.responder) || void 0 === i2 ? void 0 : i2.getSelectedRange(), point: Sr(t3) });
}, dragenter(t3) {
  Ar(t3) && t3.preventDefault();
}, dragover(t3) {
  if (this.dragging) {
    t3.preventDefault();
    const i2 = Sr(t3);
    var e2;
    if (!Tt(i2, this.dragging.point)) return this.dragging.point = i2, null === (e2 = this.responder) || void 0 === e2 ? void 0 : e2.setLocationRangeFromPointRange(i2);
  } else Ar(t3) && t3.preventDefault();
}, drop(t3) {
  var e2, i2;
  if (this.dragging) return t3.preventDefault(), null === (e2 = this.delegate) || void 0 === e2 || e2.inputControllerWillMoveText(), null === (i2 = this.responder) || void 0 === i2 || i2.moveTextFromRange(this.dragging.range), this.dragging = null, this.scheduleRender();
  if (Ar(t3)) {
    var n2;
    t3.preventDefault();
    const e3 = Sr(t3);
    return null === (n2 = this.responder) || void 0 === n2 || n2.setLocationRangeFromPointRange(e3), this.attachFiles(t3.dataTransfer.files);
  }
}, dragend() {
  var t3;
  this.dragging && (null === (t3 = this.responder) || void 0 === t3 || t3.setSelectedRange(this.dragging.range), this.dragging = null);
}, compositionend(t3) {
  this.composing && (this.composing = false, a.recentAndroid || this.scheduleRender());
} }), wi(br, "keys", { ArrowLeft() {
  var t3, e2;
  if (null !== (t3 = this.responder) && void 0 !== t3 && t3.shouldManageMovingCursorInDirection("backward")) return this.event.preventDefault(), null === (e2 = this.responder) || void 0 === e2 ? void 0 : e2.moveCursorInDirection("backward");
}, ArrowRight() {
  var t3, e2;
  if (null !== (t3 = this.responder) && void 0 !== t3 && t3.shouldManageMovingCursorInDirection("forward")) return this.event.preventDefault(), null === (e2 = this.responder) || void 0 === e2 ? void 0 : e2.moveCursorInDirection("forward");
}, Backspace() {
  var t3, e2, i2;
  if (null !== (t3 = this.responder) && void 0 !== t3 && t3.shouldManageDeletingInDirection("backward")) return this.event.preventDefault(), null === (e2 = this.delegate) || void 0 === e2 || e2.inputControllerWillPerformTyping(), null === (i2 = this.responder) || void 0 === i2 || i2.deleteInDirection("backward"), this.render();
}, Tab() {
  var t3, e2;
  if (null !== (t3 = this.responder) && void 0 !== t3 && t3.canIncreaseNestingLevel()) return this.event.preventDefault(), null === (e2 = this.responder) || void 0 === e2 || e2.increaseNestingLevel(), this.render();
}, "Tab+Shift"() {
  var t3, e2;
  if (null !== (t3 = this.responder) && void 0 !== t3 && t3.canDecreaseNestingLevel()) return this.event.preventDefault(), null === (e2 = this.responder) || void 0 === e2 || e2.decreaseNestingLevel(), this.render();
} }), wi(br, "inputTypes", { deleteByComposition() {
  return this.deleteInDirection("backward", { recordUndoEntry: false });
}, deleteByCut() {
  return this.deleteInDirection("backward");
}, deleteByDrag() {
  return this.event.preventDefault(), this.withTargetDOMRange(function() {
    var t3;
    this.deleteByDragRange = null === (t3 = this.responder) || void 0 === t3 ? void 0 : t3.getSelectedRange();
  });
}, deleteCompositionText() {
  return this.deleteInDirection("backward", { recordUndoEntry: false });
}, deleteContent() {
  return this.deleteInDirection("backward");
}, deleteContentBackward() {
  return this.deleteInDirection("backward");
}, deleteContentForward() {
  return this.deleteInDirection("forward");
}, deleteEntireSoftLine() {
  return this.deleteInDirection("forward");
}, deleteHardLineBackward() {
  return this.deleteInDirection("backward");
}, deleteHardLineForward() {
  return this.deleteInDirection("forward");
}, deleteSoftLineBackward() {
  return this.deleteInDirection("backward");
}, deleteSoftLineForward() {
  return this.deleteInDirection("forward");
}, deleteWordBackward() {
  return this.deleteInDirection("backward");
}, deleteWordForward() {
  return this.deleteInDirection("forward");
}, formatBackColor() {
  return this.activateAttributeIfSupported("backgroundColor", this.event.data);
}, formatBold() {
  return this.toggleAttributeIfSupported("bold");
}, formatFontColor() {
  return this.activateAttributeIfSupported("color", this.event.data);
}, formatFontName() {
  return this.activateAttributeIfSupported("font", this.event.data);
}, formatIndent() {
  var t3;
  if (null !== (t3 = this.responder) && void 0 !== t3 && t3.canIncreaseNestingLevel()) return this.withTargetDOMRange(function() {
    var t4;
    return null === (t4 = this.responder) || void 0 === t4 ? void 0 : t4.increaseNestingLevel();
  });
}, formatItalic() {
  return this.toggleAttributeIfSupported("italic");
}, formatJustifyCenter() {
  return this.toggleAttributeIfSupported("justifyCenter");
}, formatJustifyFull() {
  return this.toggleAttributeIfSupported("justifyFull");
}, formatJustifyLeft() {
  return this.toggleAttributeIfSupported("justifyLeft");
}, formatJustifyRight() {
  return this.toggleAttributeIfSupported("justifyRight");
}, formatOutdent() {
  var t3;
  if (null !== (t3 = this.responder) && void 0 !== t3 && t3.canDecreaseNestingLevel()) return this.withTargetDOMRange(function() {
    var t4;
    return null === (t4 = this.responder) || void 0 === t4 ? void 0 : t4.decreaseNestingLevel();
  });
}, formatRemove() {
  this.withTargetDOMRange(function() {
    for (const i2 in null === (t3 = this.responder) || void 0 === t3 ? void 0 : t3.getCurrentAttributes()) {
      var t3, e2;
      null === (e2 = this.responder) || void 0 === e2 || e2.removeCurrentAttribute(i2);
    }
  });
}, formatSetBlockTextDirection() {
  return this.activateAttributeIfSupported("blockDir", this.event.data);
}, formatSetInlineTextDirection() {
  return this.activateAttributeIfSupported("textDir", this.event.data);
}, formatStrikeThrough() {
  return this.toggleAttributeIfSupported("strike");
}, formatSubscript() {
  return this.toggleAttributeIfSupported("sub");
}, formatSuperscript() {
  return this.toggleAttributeIfSupported("sup");
}, formatUnderline() {
  return this.toggleAttributeIfSupported("underline");
}, historyRedo() {
  var t3;
  return null === (t3 = this.delegate) || void 0 === t3 ? void 0 : t3.inputControllerWillPerformRedo();
}, historyUndo() {
  var t3;
  return null === (t3 = this.delegate) || void 0 === t3 ? void 0 : t3.inputControllerWillPerformUndo();
}, insertCompositionText() {
  return this.composing = true, this.insertString(this.event.data);
}, insertFromComposition() {
  return this.composing = false, this.insertString(this.event.data);
}, insertFromDrop() {
  const t3 = this.deleteByDragRange;
  var e2;
  if (t3) return this.deleteByDragRange = null, null === (e2 = this.delegate) || void 0 === e2 || e2.inputControllerWillMoveText(), this.withTargetDOMRange(function() {
    var e3;
    return null === (e3 = this.responder) || void 0 === e3 ? void 0 : e3.moveTextFromRange(t3);
  });
}, insertFromPaste() {
  const { dataTransfer: t3 } = this.event, e2 = { dataTransfer: t3 }, i2 = t3.getData("URL"), n2 = t3.getData("text/html");
  if (i2) {
    var r2;
    let n3;
    this.event.preventDefault(), e2.type = "text/html";
    const o3 = t3.getData("public.url-name");
    n3 = o3 ? Vt(o3).trim() : i2, e2.html = this.createLinkHTML(i2, n3), null === (r2 = this.delegate) || void 0 === r2 || r2.inputControllerWillPaste(e2), this.withTargetDOMRange(function() {
      var t4;
      return null === (t4 = this.responder) || void 0 === t4 ? void 0 : t4.insertHTML(e2.html);
    }), this.afterRender = () => {
      var t4;
      return null === (t4 = this.delegate) || void 0 === t4 ? void 0 : t4.inputControllerDidPaste(e2);
    };
  } else if (Et(t3)) {
    var o2;
    e2.type = "text/plain", e2.string = t3.getData("text/plain"), null === (o2 = this.delegate) || void 0 === o2 || o2.inputControllerWillPaste(e2), this.withTargetDOMRange(function() {
      var t4;
      return null === (t4 = this.responder) || void 0 === t4 ? void 0 : t4.insertString(e2.string);
    }), this.afterRender = () => {
      var t4;
      return null === (t4 = this.delegate) || void 0 === t4 ? void 0 : t4.inputControllerDidPaste(e2);
    };
  } else if (yr(this.event)) {
    var s2;
    e2.type = "File", e2.file = t3.files[0], null === (s2 = this.delegate) || void 0 === s2 || s2.inputControllerWillPaste(e2), this.withTargetDOMRange(function() {
      var t4;
      return null === (t4 = this.responder) || void 0 === t4 ? void 0 : t4.insertFile(e2.file);
    }), this.afterRender = () => {
      var t4;
      return null === (t4 = this.delegate) || void 0 === t4 ? void 0 : t4.inputControllerDidPaste(e2);
    };
  } else if (n2) {
    var a2;
    this.event.preventDefault(), e2.type = "text/html", e2.html = n2, null === (a2 = this.delegate) || void 0 === a2 || a2.inputControllerWillPaste(e2), this.withTargetDOMRange(function() {
      var t4;
      return null === (t4 = this.responder) || void 0 === t4 ? void 0 : t4.insertHTML(e2.html);
    }), this.afterRender = () => {
      var t4;
      return null === (t4 = this.delegate) || void 0 === t4 ? void 0 : t4.inputControllerDidPaste(e2);
    };
  }
}, insertFromYank() {
  return this.insertString(this.event.data);
}, insertLineBreak() {
  return this.insertString("\n");
}, insertLink() {
  return this.activateAttributeIfSupported("href", this.event.data);
}, insertOrderedList() {
  return this.toggleAttributeIfSupported("number");
}, insertParagraph() {
  var t3;
  return null === (t3 = this.delegate) || void 0 === t3 || t3.inputControllerWillPerformTyping(), this.withTargetDOMRange(function() {
    var t4;
    return null === (t4 = this.responder) || void 0 === t4 ? void 0 : t4.insertLineBreak();
  });
}, insertReplacementText() {
  const t3 = this.event.dataTransfer.getData("text/plain"), e2 = this.event.getTargetRanges()[0];
  this.withTargetDOMRange(e2, () => {
    this.insertString(t3, { updatePosition: false });
  });
}, insertText() {
  var t3;
  return this.insertString(this.event.data || (null === (t3 = this.event.dataTransfer) || void 0 === t3 ? void 0 : t3.getData("text/plain")));
}, insertTranspose() {
  return this.insertString(this.event.data);
}, insertUnorderedList() {
  return this.toggleAttributeIfSupported("bullet");
} });
var vr = function(t3) {
  const e2 = document.createRange();
  return e2.setStart(t3.startContainer, t3.startOffset), e2.setEnd(t3.endContainer, t3.endOffset), e2;
};
var Ar = (t3) => {
  var e2;
  return Array.from((null === (e2 = t3.dataTransfer) || void 0 === e2 ? void 0 : e2.types) || []).includes("Files");
};
var yr = (t3) => {
  var e2;
  return (null === (e2 = t3.dataTransfer.files) || void 0 === e2 ? void 0 : e2[0]) && !xr(t3) && !((t4) => {
    let { dataTransfer: e3 } = t4;
    return e3.types.includes("Files") && e3.types.includes("text/html") && e3.getData("text/html").includes("urn:schemas-microsoft-com:office:office");
  })(t3);
};
var xr = function(t3) {
  const e2 = t3.clipboardData;
  if (e2) {
    return Array.from(e2.types).filter((t4) => t4.match(/file/i)).length === e2.types.length && e2.files.length >= 1;
  }
};
var Cr = function(t3) {
  const e2 = t3.clipboardData;
  if (e2) return e2.types.includes("text/plain") && 1 === e2.types.length;
};
var Er = function(t3) {
  const e2 = [];
  return t3.altKey && e2.push("alt"), t3.shiftKey && e2.push("shift"), e2.push(t3.key), e2;
};
var Sr = (t3) => ({ x: t3.clientX, y: t3.clientY });
var Rr = "[data-trix-attribute]";
var kr = "[data-trix-action]";
var Tr = "".concat(Rr, ", ").concat(kr);
var wr = "[data-trix-dialog]";
var Lr = "".concat(wr, "[data-trix-active]");
var Dr = "".concat(wr, " [data-trix-method]");
var Nr = "".concat(wr, " [data-trix-input]");
var Ir = (t3, e2) => (e2 || (e2 = Fr(t3)), t3.querySelector("[data-trix-input][name='".concat(e2, "']")));
var Or = (t3) => t3.getAttribute("data-trix-action");
var Fr = (t3) => t3.getAttribute("data-trix-attribute") || t3.getAttribute("data-trix-dialog-attribute");
var Pr = class extends q {
  constructor(t3) {
    super(t3), this.didClickActionButton = this.didClickActionButton.bind(this), this.didClickAttributeButton = this.didClickAttributeButton.bind(this), this.didClickDialogButton = this.didClickDialogButton.bind(this), this.didKeyDownDialogInput = this.didKeyDownDialogInput.bind(this), this.element = t3, this.attributes = {}, this.actions = {}, this.resetDialogInputs(), b("mousedown", { onElement: this.element, matchingSelector: kr, withCallback: this.didClickActionButton }), b("mousedown", { onElement: this.element, matchingSelector: Rr, withCallback: this.didClickAttributeButton }), b("click", { onElement: this.element, matchingSelector: Tr, preventDefault: true }), b("click", { onElement: this.element, matchingSelector: Dr, withCallback: this.didClickDialogButton }), b("keydown", { onElement: this.element, matchingSelector: Nr, withCallback: this.didKeyDownDialogInput });
  }
  didClickActionButton(t3, e2) {
    var i2;
    null === (i2 = this.delegate) || void 0 === i2 || i2.toolbarDidClickButton(), t3.preventDefault();
    const n2 = Or(e2);
    return this.getDialog(n2) ? this.toggleDialog(n2) : null === (r2 = this.delegate) || void 0 === r2 ? void 0 : r2.toolbarDidInvokeAction(n2, e2);
    var r2;
  }
  didClickAttributeButton(t3, e2) {
    var i2;
    null === (i2 = this.delegate) || void 0 === i2 || i2.toolbarDidClickButton(), t3.preventDefault();
    const n2 = Fr(e2);
    var r2;
    this.getDialog(n2) ? this.toggleDialog(n2) : null === (r2 = this.delegate) || void 0 === r2 || r2.toolbarDidToggleAttribute(n2);
    return this.refreshAttributeButtons();
  }
  didClickDialogButton(t3, e2) {
    const i2 = y(e2, { matchingSelector: wr });
    return this[e2.getAttribute("data-trix-method")].call(this, i2);
  }
  didKeyDownDialogInput(t3, e2) {
    if (13 === t3.keyCode) {
      t3.preventDefault();
      const i2 = e2.getAttribute("name"), n2 = this.getDialog(i2);
      this.setAttribute(n2);
    }
    if (27 === t3.keyCode) return t3.preventDefault(), this.hideDialog();
  }
  updateActions(t3) {
    return this.actions = t3, this.refreshActionButtons();
  }
  refreshActionButtons() {
    return this.eachActionButton((t3, e2) => {
      t3.disabled = false === this.actions[e2];
    });
  }
  eachActionButton(t3) {
    return Array.from(this.element.querySelectorAll(kr)).map((e2) => t3(e2, Or(e2)));
  }
  updateAttributes(t3) {
    return this.attributes = t3, this.refreshAttributeButtons();
  }
  refreshAttributeButtons() {
    return this.eachAttributeButton((t3, e2) => (t3.disabled = false === this.attributes[e2], this.attributes[e2] || this.dialogIsVisible(e2) ? (t3.setAttribute("data-trix-active", ""), t3.classList.add("trix-active")) : (t3.removeAttribute("data-trix-active"), t3.classList.remove("trix-active"))));
  }
  eachAttributeButton(t3) {
    return Array.from(this.element.querySelectorAll(Rr)).map((e2) => t3(e2, Fr(e2)));
  }
  applyKeyboardCommand(t3) {
    const e2 = JSON.stringify(t3.sort());
    for (const t4 of Array.from(this.element.querySelectorAll("[data-trix-key]"))) {
      const i2 = t4.getAttribute("data-trix-key").split("+");
      if (JSON.stringify(i2.sort()) === e2) return v("mousedown", { onElement: t4 }), true;
    }
    return false;
  }
  dialogIsVisible(t3) {
    const e2 = this.getDialog(t3);
    if (e2) return e2.hasAttribute("data-trix-active");
  }
  toggleDialog(t3) {
    return this.dialogIsVisible(t3) ? this.hideDialog() : this.showDialog(t3);
  }
  showDialog(t3) {
    var e2, i2;
    this.hideDialog(), null === (e2 = this.delegate) || void 0 === e2 || e2.toolbarWillShowDialog();
    const n2 = this.getDialog(t3);
    n2.setAttribute("data-trix-active", ""), n2.classList.add("trix-active"), Array.from(n2.querySelectorAll("input[disabled]")).forEach((t4) => {
      t4.removeAttribute("disabled");
    });
    const r2 = Fr(n2);
    if (r2) {
      const e3 = Ir(n2, t3);
      e3 && (e3.value = this.attributes[r2] || "", e3.select());
    }
    return null === (i2 = this.delegate) || void 0 === i2 ? void 0 : i2.toolbarDidShowDialog(t3);
  }
  setAttribute(t3) {
    var e2;
    const i2 = Fr(t3), n2 = Ir(t3, i2);
    return !n2.willValidate || (n2.setCustomValidity(""), n2.checkValidity() && this.isSafeAttribute(n2)) ? (null === (e2 = this.delegate) || void 0 === e2 || e2.toolbarDidUpdateAttribute(i2, n2.value), this.hideDialog()) : (n2.setCustomValidity("Invalid value"), n2.setAttribute("data-trix-validate", ""), n2.classList.add("trix-validate"), n2.focus());
  }
  isSafeAttribute(t3) {
    return !t3.hasAttribute("data-trix-validate-href") || si.isValidAttribute("a", "href", t3.value);
  }
  removeAttribute(t3) {
    var e2;
    const i2 = Fr(t3);
    return null === (e2 = this.delegate) || void 0 === e2 || e2.toolbarDidRemoveAttribute(i2), this.hideDialog();
  }
  hideDialog() {
    const t3 = this.element.querySelector(Lr);
    var e2;
    if (t3) return t3.removeAttribute("data-trix-active"), t3.classList.remove("trix-active"), this.resetDialogInputs(), null === (e2 = this.delegate) || void 0 === e2 ? void 0 : e2.toolbarDidHideDialog(((t4) => t4.getAttribute("data-trix-dialog"))(t3));
  }
  resetDialogInputs() {
    Array.from(this.element.querySelectorAll(Nr)).forEach((t3) => {
      t3.setAttribute("disabled", "disabled"), t3.removeAttribute("data-trix-validate"), t3.classList.remove("trix-validate");
    });
  }
  getDialog(t3) {
    return this.element.querySelector("[data-trix-dialog=".concat(t3, "]"));
  }
};
var Mr = class extends Yn {
  constructor(t3) {
    let { editorElement: e2, document: i2, html: n2 } = t3;
    super(...arguments), this.editorElement = e2, this.selectionManager = new Wn(this.editorElement), this.selectionManager.delegate = this, this.composition = new kn(), this.composition.delegate = this, this.attachmentManager = new Sn(this.composition.getAttachments()), this.attachmentManager.delegate = this, this.inputController = 2 === _.getLevel() ? new br(this.editorElement) : new hr(this.editorElement), this.inputController.delegate = this, this.inputController.responder = this.composition, this.compositionController = new Gn(this.editorElement, this.composition), this.compositionController.delegate = this, this.toolbarController = new Pr(this.editorElement.toolbarElement), this.toolbarController.delegate = this, this.editor = new On(this.composition, this.selectionManager, this.editorElement), i2 ? this.editor.loadDocument(i2) : this.editor.loadHTML(n2);
  }
  registerSelectionManager() {
    return Ft.registerSelectionManager(this.selectionManager);
  }
  unregisterSelectionManager() {
    return Ft.unregisterSelectionManager(this.selectionManager);
  }
  render() {
    return this.compositionController.render();
  }
  reparse() {
    return this.composition.replaceHTML(this.editorElement.innerHTML);
  }
  compositionDidChangeDocument(t3) {
    if (this.notifyEditorElement("document-change"), !this.handlingInput) return this.render();
  }
  compositionDidChangeCurrentAttributes(t3) {
    return this.currentAttributes = t3, this.toolbarController.updateAttributes(this.currentAttributes), this.updateCurrentActions(), this.notifyEditorElement("attributes-change", { attributes: this.currentAttributes });
  }
  compositionDidPerformInsertionAtRange(t3) {
    this.pasting && (this.pastedRange = t3);
  }
  compositionShouldAcceptFile(t3) {
    return this.notifyEditorElement("file-accept", { file: t3 });
  }
  compositionDidAddAttachment(t3) {
    const e2 = this.attachmentManager.manageAttachment(t3);
    return this.notifyEditorElement("attachment-add", { attachment: e2 });
  }
  compositionDidEditAttachment(t3) {
    this.compositionController.rerenderViewForObject(t3);
    const e2 = this.attachmentManager.manageAttachment(t3);
    return this.notifyEditorElement("attachment-edit", { attachment: e2 }), this.notifyEditorElement("change");
  }
  compositionDidChangeAttachmentPreviewURL(t3) {
    return this.compositionController.invalidateViewForObject(t3), this.notifyEditorElement("change");
  }
  compositionDidRemoveAttachment(t3) {
    const e2 = this.attachmentManager.unmanageAttachment(t3);
    return this.notifyEditorElement("attachment-remove", { attachment: e2 });
  }
  compositionDidStartEditingAttachment(t3, e2) {
    return this.attachmentLocationRange = this.composition.document.getLocationRangeOfAttachment(t3), this.compositionController.installAttachmentEditorForAttachment(t3, e2), this.selectionManager.setLocationRange(this.attachmentLocationRange);
  }
  compositionDidStopEditingAttachment(t3) {
    this.compositionController.uninstallAttachmentEditor(), this.attachmentLocationRange = null;
  }
  compositionDidRequestChangingSelectionToLocationRange(t3) {
    if (!this.loadingSnapshot || this.isFocused()) return this.requestedLocationRange = t3, this.compositionRevisionWhenLocationRangeRequested = this.composition.revision, this.handlingInput ? void 0 : this.render();
  }
  compositionWillLoadSnapshot() {
    this.loadingSnapshot = true;
  }
  compositionDidLoadSnapshot() {
    this.compositionController.refreshViewCache(), this.render(), this.loadingSnapshot = false;
  }
  getSelectionManager() {
    return this.selectionManager;
  }
  attachmentManagerDidRequestRemovalOfAttachment(t3) {
    return this.removeAttachment(t3);
  }
  compositionControllerWillSyncDocumentView() {
    return this.inputController.editorWillSyncDocumentView(), this.selectionManager.lock(), this.selectionManager.clearSelection();
  }
  compositionControllerDidSyncDocumentView() {
    return this.inputController.editorDidSyncDocumentView(), this.selectionManager.unlock(), this.updateCurrentActions(), this.notifyEditorElement("sync");
  }
  compositionControllerDidRender() {
    this.requestedLocationRange && (this.compositionRevisionWhenLocationRangeRequested === this.composition.revision && this.selectionManager.setLocationRange(this.requestedLocationRange), this.requestedLocationRange = null, this.compositionRevisionWhenLocationRangeRequested = null), this.renderedCompositionRevision !== this.composition.revision && (this.runEditorFilters(), this.composition.updateCurrentAttributes(), this.notifyEditorElement("render")), this.renderedCompositionRevision = this.composition.revision;
  }
  compositionControllerDidFocus() {
    return this.isFocusedInvisibly() && this.setLocationRange({ index: 0, offset: 0 }), this.toolbarController.hideDialog(), this.notifyEditorElement("focus");
  }
  compositionControllerDidBlur() {
    return this.notifyEditorElement("blur");
  }
  compositionControllerDidSelectAttachment(t3, e2) {
    return this.toolbarController.hideDialog(), this.composition.editAttachment(t3, e2);
  }
  compositionControllerDidRequestDeselectingAttachment(t3) {
    const e2 = this.attachmentLocationRange || this.composition.document.getLocationRangeOfAttachment(t3);
    return this.selectionManager.setLocationRange(e2[1]);
  }
  compositionControllerWillUpdateAttachment(t3) {
    return this.editor.recordUndoEntry("Edit Attachment", { context: t3.id, consolidatable: true });
  }
  compositionControllerDidRequestRemovalOfAttachment(t3) {
    return this.removeAttachment(t3);
  }
  inputControllerWillHandleInput() {
    this.handlingInput = true, this.requestedRender = false;
  }
  inputControllerDidRequestRender() {
    this.requestedRender = true;
  }
  inputControllerDidHandleInput() {
    if (this.handlingInput = false, this.requestedRender) return this.requestedRender = false, this.render();
  }
  inputControllerDidAllowUnhandledInput() {
    return this.notifyEditorElement("change");
  }
  inputControllerDidRequestReparse() {
    return this.reparse();
  }
  inputControllerWillPerformTyping() {
    return this.recordTypingUndoEntry();
  }
  inputControllerWillPerformFormatting(t3) {
    return this.recordFormattingUndoEntry(t3);
  }
  inputControllerWillCutText() {
    return this.editor.recordUndoEntry("Cut");
  }
  inputControllerWillPaste(t3) {
    return this.editor.recordUndoEntry("Paste"), this.pasting = true, this.notifyEditorElement("before-paste", { paste: t3 });
  }
  inputControllerDidPaste(t3) {
    return t3.range = this.pastedRange, this.pastedRange = null, this.pasting = null, this.notifyEditorElement("paste", { paste: t3 });
  }
  inputControllerWillMoveText() {
    return this.editor.recordUndoEntry("Move");
  }
  inputControllerWillAttachFiles() {
    return this.editor.recordUndoEntry("Drop Files");
  }
  inputControllerWillPerformUndo() {
    return this.editor.undo();
  }
  inputControllerWillPerformRedo() {
    return this.editor.redo();
  }
  inputControllerDidReceiveKeyboardCommand(t3) {
    return this.toolbarController.applyKeyboardCommand(t3);
  }
  inputControllerDidStartDrag() {
    this.locationRangeBeforeDrag = this.selectionManager.getLocationRange();
  }
  inputControllerDidReceiveDragOverPoint(t3) {
    return this.selectionManager.setLocationRangeFromPointRange(t3);
  }
  inputControllerDidCancelDrag() {
    this.selectionManager.setLocationRange(this.locationRangeBeforeDrag), this.locationRangeBeforeDrag = null;
  }
  locationRangeDidChange(t3) {
    return this.composition.updateCurrentAttributes(), this.updateCurrentActions(), this.attachmentLocationRange && !Dt(this.attachmentLocationRange, t3) && this.composition.stopEditingAttachment(), this.notifyEditorElement("selection-change");
  }
  toolbarDidClickButton() {
    if (!this.getLocationRange()) return this.setLocationRange({ index: 0, offset: 0 });
  }
  toolbarDidInvokeAction(t3, e2) {
    return this.invokeAction(t3, e2);
  }
  toolbarDidToggleAttribute(t3) {
    if (this.recordFormattingUndoEntry(t3), this.composition.toggleCurrentAttribute(t3), this.render(), !this.selectionFrozen) return this.editorElement.focus();
  }
  toolbarDidUpdateAttribute(t3, e2) {
    if (this.recordFormattingUndoEntry(t3), this.composition.setCurrentAttribute(t3, e2), this.render(), !this.selectionFrozen) return this.editorElement.focus();
  }
  toolbarDidRemoveAttribute(t3) {
    if (this.recordFormattingUndoEntry(t3), this.composition.removeCurrentAttribute(t3), this.render(), !this.selectionFrozen) return this.editorElement.focus();
  }
  toolbarWillShowDialog(t3) {
    return this.composition.expandSelectionForEditing(), this.freezeSelection();
  }
  toolbarDidShowDialog(t3) {
    return this.notifyEditorElement("toolbar-dialog-show", { dialogName: t3 });
  }
  toolbarDidHideDialog(t3) {
    return this.thawSelection(), this.editorElement.focus(), this.notifyEditorElement("toolbar-dialog-hide", { dialogName: t3 });
  }
  freezeSelection() {
    if (!this.selectionFrozen) return this.selectionManager.lock(), this.composition.freezeSelection(), this.selectionFrozen = true, this.render();
  }
  thawSelection() {
    if (this.selectionFrozen) return this.composition.thawSelection(), this.selectionManager.unlock(), this.selectionFrozen = false, this.render();
  }
  canInvokeAction(t3) {
    return !!this.actionIsExternal(t3) || !(null === (e2 = this.actions[t3]) || void 0 === e2 || null === (e2 = e2.test) || void 0 === e2 || !e2.call(this));
    var e2;
  }
  invokeAction(t3, e2) {
    return this.actionIsExternal(t3) ? this.notifyEditorElement("action-invoke", { actionName: t3, invokingElement: e2 }) : null === (i2 = this.actions[t3]) || void 0 === i2 || null === (i2 = i2.perform) || void 0 === i2 ? void 0 : i2.call(this);
    var i2;
  }
  actionIsExternal(t3) {
    return /^x-./.test(t3);
  }
  getCurrentActions() {
    const t3 = {};
    for (const e2 in this.actions) t3[e2] = this.canInvokeAction(e2);
    return t3;
  }
  updateCurrentActions() {
    const t3 = this.getCurrentActions();
    if (!Tt(t3, this.currentActions)) return this.currentActions = t3, this.toolbarController.updateActions(this.currentActions), this.notifyEditorElement("actions-change", { actions: this.currentActions });
  }
  runEditorFilters() {
    let t3 = this.composition.getSnapshot();
    if (Array.from(this.editor.filters).forEach((e3) => {
      const { document: i3, selectedRange: n2 } = t3;
      t3 = e3.call(this.editor, t3) || {}, t3.document || (t3.document = i3), t3.selectedRange || (t3.selectedRange = n2);
    }), e2 = t3, i2 = this.composition.getSnapshot(), !Dt(e2.selectedRange, i2.selectedRange) || !e2.document.isEqualTo(i2.document)) return this.composition.loadSnapshot(t3);
    var e2, i2;
  }
  updateInputElement() {
    const t3 = function(t4, e2) {
      const i2 = xn[e2];
      if (i2) return i2(t4);
      throw new Error("unknown content type: ".concat(e2));
    }(this.compositionController.getSerializableElement(), "text/html");
    return this.editorElement.setFormValue(t3);
  }
  notifyEditorElement(t3, e2) {
    switch (t3) {
      case "document-change":
        this.documentChangedSinceLastRender = true;
        break;
      case "render":
        this.documentChangedSinceLastRender && (this.documentChangedSinceLastRender = false, this.notifyEditorElement("change"));
        break;
      case "change":
      case "attachment-add":
      case "attachment-edit":
      case "attachment-remove":
        this.updateInputElement();
    }
    return this.editorElement.notify(t3, e2);
  }
  removeAttachment(t3) {
    return this.editor.recordUndoEntry("Delete Attachment"), this.composition.removeAttachment(t3), this.render();
  }
  recordFormattingUndoEntry(t3) {
    const e2 = mt(t3), i2 = this.selectionManager.getLocationRange();
    if (e2 || !Lt(i2)) return this.editor.recordUndoEntry("Formatting", { context: this.getUndoContext(), consolidatable: true });
  }
  recordTypingUndoEntry() {
    return this.editor.recordUndoEntry("Typing", { context: this.getUndoContext(this.currentAttributes), consolidatable: true });
  }
  getUndoContext() {
    for (var t3 = arguments.length, e2 = new Array(t3), i2 = 0; i2 < t3; i2++) e2[i2] = arguments[i2];
    return [this.getLocationContext(), this.getTimeContext(), ...Array.from(e2)];
  }
  getLocationContext() {
    const t3 = this.selectionManager.getLocationRange();
    return Lt(t3) ? t3[0].index : t3;
  }
  getTimeContext() {
    return V.interval > 0 ? Math.floor((/* @__PURE__ */ new Date()).getTime() / V.interval) : 0;
  }
  isFocused() {
    var t3;
    return this.editorElement === (null === (t3 = this.editorElement.ownerDocument) || void 0 === t3 ? void 0 : t3.activeElement);
  }
  isFocusedInvisibly() {
    return this.isFocused() && !this.getLocationRange();
  }
  get actions() {
    return this.constructor.actions;
  }
};
wi(Mr, "actions", { undo: { test() {
  return this.editor.canUndo();
}, perform() {
  return this.editor.undo();
} }, redo: { test() {
  return this.editor.canRedo();
}, perform() {
  return this.editor.redo();
} }, link: { test() {
  return this.editor.canActivateAttribute("href");
} }, increaseNestingLevel: { test() {
  return this.editor.canIncreaseNestingLevel();
}, perform() {
  return this.editor.increaseNestingLevel() && this.render();
} }, decreaseNestingLevel: { test() {
  return this.editor.canDecreaseNestingLevel();
}, perform() {
  return this.editor.decreaseNestingLevel() && this.render();
} }, attachFiles: { test: () => true, perform() {
  return _.pickFiles(this.editor.insertFiles);
} } }), Mr.proxyMethod("getSelectionManager().setLocationRange"), Mr.proxyMethod("getSelectionManager().getLocationRange");
var Br = Object.freeze({ __proto__: null, AttachmentEditorController: Kn, CompositionController: Gn, Controller: Yn, EditorController: Mr, InputController: sr, Level0InputController: hr, Level2InputController: br, ToolbarController: Pr });
var _r = Object.freeze({ __proto__: null, MutationObserver: Qn, SelectionChangeObserver: Ot });
var jr = Object.freeze({ __proto__: null, FileVerificationOperation: er, ImagePreloadOperation: ji });
vt("trix-toolbar", "%t {\n  display: block;\n}\n\n%t {\n  white-space: nowrap;\n}\n\n%t [data-trix-dialog] {\n  display: none;\n}\n\n%t [data-trix-dialog][data-trix-active] {\n  display: block;\n}\n\n%t [data-trix-dialog] [data-trix-validate]:invalid {\n  background-color: #ffdddd;\n}");
var Wr = class extends HTMLElement {
  connectedCallback() {
    "" === this.innerHTML && (this.innerHTML = U.getDefaultHTML());
  }
};
var Ur = 0;
var Vr = function(t3) {
  if (!t3.hasAttribute("contenteditable")) return t3.setAttribute("contenteditable", ""), function(t4) {
    let e2 = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {};
    return e2.times = 1, b(t4, e2);
  }("focus", { onElement: t3, withCallback: () => zr(t3) });
};
var zr = function(t3) {
  return qr(t3), Hr(t3);
};
var qr = function(t3) {
  var e2, i2;
  if (null !== (e2 = (i2 = document).queryCommandSupported) && void 0 !== e2 && e2.call(i2, "enableObjectResizing")) return document.execCommand("enableObjectResizing", false, false), b("mscontrolselect", { onElement: t3, preventDefault: true });
};
var Hr = function(t3) {
  var e2, i2;
  if (null !== (e2 = (i2 = document).queryCommandSupported) && void 0 !== e2 && e2.call(i2, "DefaultParagraphSeparator")) {
    const { tagName: t4 } = n.default;
    if (["div", "p"].includes(t4)) return document.execCommand("DefaultParagraphSeparator", false, t4);
  }
};
var Jr = a.forcesObjectResizing ? { display: "inline", width: "auto" } : { display: "inline-block", width: "1px" };
vt("trix-editor", "%t {\n    display: block;\n}\n\n%t:empty::before {\n    content: attr(placeholder);\n    color: graytext;\n    cursor: text;\n    pointer-events: none;\n    white-space: pre-line;\n}\n\n%t a[contenteditable=false] {\n    cursor: text;\n}\n\n%t img {\n    max-width: 100%;\n    height: auto;\n}\n\n%t ".concat(e, " figcaption textarea {\n    resize: none;\n}\n\n%t ").concat(e, " figcaption textarea.trix-autoresize-clone {\n    position: absolute;\n    left: -9999px;\n    max-height: 0px;\n}\n\n%t ").concat(e, " figcaption[data-trix-placeholder]:empty::before {\n    content: attr(data-trix-placeholder);\n    color: graytext;\n}\n\n%t [data-trix-cursor-target] {\n    display: ").concat(Jr.display, " !important;\n    width: ").concat(Jr.width, " !important;\n    padding: 0 !important;\n    margin: 0 !important;\n    border: none !important;\n}\n\n%t [data-trix-cursor-target=left] {\n    vertical-align: top !important;\n    margin-left: -1px !important;\n}\n\n%t [data-trix-cursor-target=right] {\n    vertical-align: bottom !important;\n    margin-right: -1px !important;\n}"));
var Kr = /* @__PURE__ */ new WeakMap();
var Gr = /* @__PURE__ */ new WeakSet();
var Yr = class {
  constructor(t3) {
    var e2, i2;
    Mi(e2 = this, i2 = Gr), i2.add(e2), Bi(this, Kr, { writable: true, value: void 0 }), this.element = t3, Ni(this, Kr, t3.attachInternals());
  }
  connectedCallback() {
    Pi(this, Gr, $r).call(this);
  }
  disconnectedCallback() {
  }
  get labels() {
    return Di(this, Kr).labels;
  }
  get disabled() {
    var t3;
    return null === (t3 = this.element.inputElement) || void 0 === t3 ? void 0 : t3.disabled;
  }
  set disabled(t3) {
    this.element.toggleAttribute("disabled", t3);
  }
  get required() {
    return this.element.hasAttribute("required");
  }
  set required(t3) {
    this.element.toggleAttribute("required", t3), Pi(this, Gr, $r).call(this);
  }
  get validity() {
    return Di(this, Kr).validity;
  }
  get validationMessage() {
    return Di(this, Kr).validationMessage;
  }
  get willValidate() {
    return Di(this, Kr).willValidate;
  }
  setFormValue(t3) {
    Pi(this, Gr, $r).call(this);
  }
  checkValidity() {
    return Di(this, Kr).checkValidity();
  }
  reportValidity() {
    return Di(this, Kr).reportValidity();
  }
  setCustomValidity(t3) {
    Pi(this, Gr, $r).call(this, t3);
  }
};
function $r() {
  let t3 = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : "";
  const { required: e2, value: i2 } = this.element, n2 = e2 && !i2, r2 = !!t3, o2 = T("input", { required: e2 }), s2 = t3 || o2.validationMessage;
  Di(this, Kr).setValidity({ valueMissing: n2, customError: r2 }, s2);
}
var Xr = /* @__PURE__ */ new WeakMap();
var Zr = /* @__PURE__ */ new WeakMap();
var Qr = /* @__PURE__ */ new WeakMap();
var to = class {
  constructor(t3) {
    Bi(this, Xr, { writable: true, value: void 0 }), Bi(this, Zr, { writable: true, value: (t4) => {
      t4.defaultPrevented || t4.target === this.element.form && this.element.reset();
    } }), Bi(this, Qr, { writable: true, value: (t4) => {
      if (t4.defaultPrevented) return;
      if (this.element.contains(t4.target)) return;
      const e2 = y(t4.target, { matchingSelector: "label" });
      e2 && Array.from(this.labels).includes(e2) && this.element.focus();
    } }), this.element = t3;
  }
  connectedCallback() {
    Ni(this, Xr, function(t3) {
      if (t3.hasAttribute("aria-label") || t3.hasAttribute("aria-labelledby")) return;
      const e2 = function() {
        const e3 = Array.from(t3.labels).map((e4) => {
          if (!e4.contains(t3)) return e4.textContent;
        }).filter((t4) => t4), i2 = e3.join(" ");
        return i2 ? t3.setAttribute("aria-label", i2) : t3.removeAttribute("aria-label");
      };
      return e2(), b("focus", { onElement: t3, withCallback: e2 });
    }(this.element)), window.addEventListener("reset", Di(this, Zr), false), window.addEventListener("click", Di(this, Qr), false);
  }
  disconnectedCallback() {
    var t3;
    null === (t3 = Di(this, Xr)) || void 0 === t3 || t3.destroy(), window.removeEventListener("reset", Di(this, Zr), false), window.removeEventListener("click", Di(this, Qr), false);
  }
  get labels() {
    const t3 = [];
    this.element.id && this.element.ownerDocument && t3.push(...Array.from(this.element.ownerDocument.querySelectorAll("label[for='".concat(this.element.id, "']")) || []));
    const e2 = y(this.element, { matchingSelector: "label" });
    return e2 && [this.element, null].includes(e2.control) && t3.push(e2), t3;
  }
  get disabled() {
    return console.warn("This browser does not support the [disabled] attribute for trix-editor elements."), false;
  }
  set disabled(t3) {
    console.warn("This browser does not support the [disabled] attribute for trix-editor elements.");
  }
  get required() {
    return console.warn("This browser does not support the [required] attribute for trix-editor elements."), false;
  }
  set required(t3) {
    console.warn("This browser does not support the [required] attribute for trix-editor elements.");
  }
  get validity() {
    return console.warn("This browser does not support the validity property for trix-editor elements."), null;
  }
  get validationMessage() {
    return console.warn("This browser does not support the validationMessage property for trix-editor elements."), "";
  }
  get willValidate() {
    return console.warn("This browser does not support the willValidate property for trix-editor elements."), false;
  }
  setFormValue(t3) {
  }
  checkValidity() {
    return console.warn("This browser does not support checkValidity() for trix-editor elements."), true;
  }
  reportValidity() {
    return console.warn("This browser does not support reportValidity() for trix-editor elements."), true;
  }
  setCustomValidity(t3) {
    console.warn("This browser does not support setCustomValidity(validationMessage) for trix-editor elements.");
  }
};
var eo = /* @__PURE__ */ new WeakMap();
var io = class extends HTMLElement {
  constructor() {
    super(), Bi(this, eo, { writable: true, value: void 0 }), Ni(this, eo, this.constructor.formAssociated ? new Yr(this) : new to(this));
  }
  get trixId() {
    return this.hasAttribute("trix-id") ? this.getAttribute("trix-id") : (this.setAttribute("trix-id", ++Ur), this.trixId);
  }
  get labels() {
    return Di(this, eo).labels;
  }
  get disabled() {
    return Di(this, eo).disabled;
  }
  set disabled(t3) {
    Di(this, eo).disabled = t3;
  }
  get required() {
    return Di(this, eo).required;
  }
  set required(t3) {
    Di(this, eo).required = t3;
  }
  get validity() {
    return Di(this, eo).validity;
  }
  get validationMessage() {
    return Di(this, eo).validationMessage;
  }
  get willValidate() {
    return Di(this, eo).willValidate;
  }
  get type() {
    return this.localName;
  }
  get toolbarElement() {
    var t3;
    if (this.hasAttribute("toolbar")) return null === (t3 = this.ownerDocument) || void 0 === t3 ? void 0 : t3.getElementById(this.getAttribute("toolbar"));
    if (this.parentNode) {
      const t4 = "trix-toolbar-".concat(this.trixId);
      return this.setAttribute("toolbar", t4), this.internalToolbar = T("trix-toolbar", { id: t4 }), this.parentNode.insertBefore(this.internalToolbar, this), this.internalToolbar;
    }
  }
  get form() {
    var t3;
    return null === (t3 = this.inputElement) || void 0 === t3 ? void 0 : t3.form;
  }
  get inputElement() {
    var t3;
    if (this.hasAttribute("input")) return null === (t3 = this.ownerDocument) || void 0 === t3 ? void 0 : t3.getElementById(this.getAttribute("input"));
    if (this.parentNode) {
      const t4 = "trix-input-".concat(this.trixId);
      this.setAttribute("input", t4);
      const e2 = T("input", { type: "hidden", id: t4 });
      return this.parentNode.insertBefore(e2, this.nextElementSibling), e2;
    }
  }
  get editor() {
    var t3;
    return null === (t3 = this.editorController) || void 0 === t3 ? void 0 : t3.editor;
  }
  get name() {
    var t3;
    return null === (t3 = this.inputElement) || void 0 === t3 ? void 0 : t3.name;
  }
  get value() {
    var t3;
    return null === (t3 = this.inputElement) || void 0 === t3 ? void 0 : t3.value;
  }
  set value(t3) {
    var e2;
    this.defaultValue = t3, null === (e2 = this.editor) || void 0 === e2 || e2.loadHTML(this.defaultValue);
  }
  attributeChangedCallback(t3, e2, i2) {
    "connected" === t3 && this.isConnected && null != e2 && e2 !== i2 && requestAnimationFrame(() => this.reconnect());
  }
  notify(t3, e2) {
    if (this.editorController) return v("trix-".concat(t3), { onElement: this, attributes: e2 });
  }
  setFormValue(t3) {
    this.inputElement && (this.inputElement.value = t3, Di(this, eo).setFormValue(t3));
  }
  connectedCallback() {
    this.hasAttribute("data-trix-internal") || (Vr(this), function(t3) {
      if (!t3.hasAttribute("role")) t3.setAttribute("role", "textbox");
    }(this), this.editorController || (v("trix-before-initialize", { onElement: this }), this.editorController = new Mr({ editorElement: this, html: this.defaultValue = this.value }), requestAnimationFrame(() => v("trix-initialize", { onElement: this }))), this.editorController.registerSelectionManager(), Di(this, eo).connectedCallback(), this.toggleAttribute("connected", true), function(t3) {
      if (!document.querySelector(":focus") && t3.hasAttribute("autofocus") && document.querySelector("[autofocus]") === t3) t3.focus();
    }(this));
  }
  disconnectedCallback() {
    var t3;
    null === (t3 = this.editorController) || void 0 === t3 || t3.unregisterSelectionManager(), Di(this, eo).disconnectedCallback(), this.toggleAttribute("connected", false);
  }
  reconnect() {
    this.removeInternalToolbar(), this.disconnectedCallback(), this.connectedCallback();
  }
  removeInternalToolbar() {
    var t3;
    null === (t3 = this.internalToolbar) || void 0 === t3 || t3.remove(), this.internalToolbar = null;
  }
  checkValidity() {
    return Di(this, eo).checkValidity();
  }
  reportValidity() {
    return Di(this, eo).reportValidity();
  }
  setCustomValidity(t3) {
    Di(this, eo).setCustomValidity(t3);
  }
  formDisabledCallback(t3) {
    this.inputElement && (this.inputElement.disabled = t3), this.toggleAttribute("contenteditable", !t3);
  }
  formResetCallback() {
    this.reset();
  }
  reset() {
    this.value = this.defaultValue;
  }
};
wi(io, "formAssociated", "ElementInternals" in window), wi(io, "observedAttributes", ["connected"]);
var no = { VERSION: t, config: z, core: Cn, models: Un, views: Vn, controllers: Br, observers: _r, operations: jr, elements: Object.freeze({ __proto__: null, TrixEditorElement: io, TrixToolbarElement: Wr }), filters: Object.freeze({ __proto__: null, Filter: Dn, attachmentGalleryFilter: Nn }) };
Object.assign(no, Un), window.Trix = no, setTimeout(function() {
  customElements.get("trix-toolbar") || customElements.define("trix-toolbar", Wr), customElements.get("trix-editor") || customElements.define("trix-editor", io);
}, 0);

// node_modules/@rails/actiontext/app/assets/javascripts/actiontext.esm.js
var sparkMd5 = {
  exports: {}
};
(function(module, exports) {
  (function(factory) {
    {
      module.exports = factory();
    }
  })(function(undefined$1) {
    var hex_chr = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "a", "b", "c", "d", "e", "f"];
    function md5cycle(x2, k2) {
      var a2 = x2[0], b2 = x2[1], c2 = x2[2], d2 = x2[3];
      a2 += (b2 & c2 | ~b2 & d2) + k2[0] - 680876936 | 0;
      a2 = (a2 << 7 | a2 >>> 25) + b2 | 0;
      d2 += (a2 & b2 | ~a2 & c2) + k2[1] - 389564586 | 0;
      d2 = (d2 << 12 | d2 >>> 20) + a2 | 0;
      c2 += (d2 & a2 | ~d2 & b2) + k2[2] + 606105819 | 0;
      c2 = (c2 << 17 | c2 >>> 15) + d2 | 0;
      b2 += (c2 & d2 | ~c2 & a2) + k2[3] - 1044525330 | 0;
      b2 = (b2 << 22 | b2 >>> 10) + c2 | 0;
      a2 += (b2 & c2 | ~b2 & d2) + k2[4] - 176418897 | 0;
      a2 = (a2 << 7 | a2 >>> 25) + b2 | 0;
      d2 += (a2 & b2 | ~a2 & c2) + k2[5] + 1200080426 | 0;
      d2 = (d2 << 12 | d2 >>> 20) + a2 | 0;
      c2 += (d2 & a2 | ~d2 & b2) + k2[6] - 1473231341 | 0;
      c2 = (c2 << 17 | c2 >>> 15) + d2 | 0;
      b2 += (c2 & d2 | ~c2 & a2) + k2[7] - 45705983 | 0;
      b2 = (b2 << 22 | b2 >>> 10) + c2 | 0;
      a2 += (b2 & c2 | ~b2 & d2) + k2[8] + 1770035416 | 0;
      a2 = (a2 << 7 | a2 >>> 25) + b2 | 0;
      d2 += (a2 & b2 | ~a2 & c2) + k2[9] - 1958414417 | 0;
      d2 = (d2 << 12 | d2 >>> 20) + a2 | 0;
      c2 += (d2 & a2 | ~d2 & b2) + k2[10] - 42063 | 0;
      c2 = (c2 << 17 | c2 >>> 15) + d2 | 0;
      b2 += (c2 & d2 | ~c2 & a2) + k2[11] - 1990404162 | 0;
      b2 = (b2 << 22 | b2 >>> 10) + c2 | 0;
      a2 += (b2 & c2 | ~b2 & d2) + k2[12] + 1804603682 | 0;
      a2 = (a2 << 7 | a2 >>> 25) + b2 | 0;
      d2 += (a2 & b2 | ~a2 & c2) + k2[13] - 40341101 | 0;
      d2 = (d2 << 12 | d2 >>> 20) + a2 | 0;
      c2 += (d2 & a2 | ~d2 & b2) + k2[14] - 1502002290 | 0;
      c2 = (c2 << 17 | c2 >>> 15) + d2 | 0;
      b2 += (c2 & d2 | ~c2 & a2) + k2[15] + 1236535329 | 0;
      b2 = (b2 << 22 | b2 >>> 10) + c2 | 0;
      a2 += (b2 & d2 | c2 & ~d2) + k2[1] - 165796510 | 0;
      a2 = (a2 << 5 | a2 >>> 27) + b2 | 0;
      d2 += (a2 & c2 | b2 & ~c2) + k2[6] - 1069501632 | 0;
      d2 = (d2 << 9 | d2 >>> 23) + a2 | 0;
      c2 += (d2 & b2 | a2 & ~b2) + k2[11] + 643717713 | 0;
      c2 = (c2 << 14 | c2 >>> 18) + d2 | 0;
      b2 += (c2 & a2 | d2 & ~a2) + k2[0] - 373897302 | 0;
      b2 = (b2 << 20 | b2 >>> 12) + c2 | 0;
      a2 += (b2 & d2 | c2 & ~d2) + k2[5] - 701558691 | 0;
      a2 = (a2 << 5 | a2 >>> 27) + b2 | 0;
      d2 += (a2 & c2 | b2 & ~c2) + k2[10] + 38016083 | 0;
      d2 = (d2 << 9 | d2 >>> 23) + a2 | 0;
      c2 += (d2 & b2 | a2 & ~b2) + k2[15] - 660478335 | 0;
      c2 = (c2 << 14 | c2 >>> 18) + d2 | 0;
      b2 += (c2 & a2 | d2 & ~a2) + k2[4] - 405537848 | 0;
      b2 = (b2 << 20 | b2 >>> 12) + c2 | 0;
      a2 += (b2 & d2 | c2 & ~d2) + k2[9] + 568446438 | 0;
      a2 = (a2 << 5 | a2 >>> 27) + b2 | 0;
      d2 += (a2 & c2 | b2 & ~c2) + k2[14] - 1019803690 | 0;
      d2 = (d2 << 9 | d2 >>> 23) + a2 | 0;
      c2 += (d2 & b2 | a2 & ~b2) + k2[3] - 187363961 | 0;
      c2 = (c2 << 14 | c2 >>> 18) + d2 | 0;
      b2 += (c2 & a2 | d2 & ~a2) + k2[8] + 1163531501 | 0;
      b2 = (b2 << 20 | b2 >>> 12) + c2 | 0;
      a2 += (b2 & d2 | c2 & ~d2) + k2[13] - 1444681467 | 0;
      a2 = (a2 << 5 | a2 >>> 27) + b2 | 0;
      d2 += (a2 & c2 | b2 & ~c2) + k2[2] - 51403784 | 0;
      d2 = (d2 << 9 | d2 >>> 23) + a2 | 0;
      c2 += (d2 & b2 | a2 & ~b2) + k2[7] + 1735328473 | 0;
      c2 = (c2 << 14 | c2 >>> 18) + d2 | 0;
      b2 += (c2 & a2 | d2 & ~a2) + k2[12] - 1926607734 | 0;
      b2 = (b2 << 20 | b2 >>> 12) + c2 | 0;
      a2 += (b2 ^ c2 ^ d2) + k2[5] - 378558 | 0;
      a2 = (a2 << 4 | a2 >>> 28) + b2 | 0;
      d2 += (a2 ^ b2 ^ c2) + k2[8] - 2022574463 | 0;
      d2 = (d2 << 11 | d2 >>> 21) + a2 | 0;
      c2 += (d2 ^ a2 ^ b2) + k2[11] + 1839030562 | 0;
      c2 = (c2 << 16 | c2 >>> 16) + d2 | 0;
      b2 += (c2 ^ d2 ^ a2) + k2[14] - 35309556 | 0;
      b2 = (b2 << 23 | b2 >>> 9) + c2 | 0;
      a2 += (b2 ^ c2 ^ d2) + k2[1] - 1530992060 | 0;
      a2 = (a2 << 4 | a2 >>> 28) + b2 | 0;
      d2 += (a2 ^ b2 ^ c2) + k2[4] + 1272893353 | 0;
      d2 = (d2 << 11 | d2 >>> 21) + a2 | 0;
      c2 += (d2 ^ a2 ^ b2) + k2[7] - 155497632 | 0;
      c2 = (c2 << 16 | c2 >>> 16) + d2 | 0;
      b2 += (c2 ^ d2 ^ a2) + k2[10] - 1094730640 | 0;
      b2 = (b2 << 23 | b2 >>> 9) + c2 | 0;
      a2 += (b2 ^ c2 ^ d2) + k2[13] + 681279174 | 0;
      a2 = (a2 << 4 | a2 >>> 28) + b2 | 0;
      d2 += (a2 ^ b2 ^ c2) + k2[0] - 358537222 | 0;
      d2 = (d2 << 11 | d2 >>> 21) + a2 | 0;
      c2 += (d2 ^ a2 ^ b2) + k2[3] - 722521979 | 0;
      c2 = (c2 << 16 | c2 >>> 16) + d2 | 0;
      b2 += (c2 ^ d2 ^ a2) + k2[6] + 76029189 | 0;
      b2 = (b2 << 23 | b2 >>> 9) + c2 | 0;
      a2 += (b2 ^ c2 ^ d2) + k2[9] - 640364487 | 0;
      a2 = (a2 << 4 | a2 >>> 28) + b2 | 0;
      d2 += (a2 ^ b2 ^ c2) + k2[12] - 421815835 | 0;
      d2 = (d2 << 11 | d2 >>> 21) + a2 | 0;
      c2 += (d2 ^ a2 ^ b2) + k2[15] + 530742520 | 0;
      c2 = (c2 << 16 | c2 >>> 16) + d2 | 0;
      b2 += (c2 ^ d2 ^ a2) + k2[2] - 995338651 | 0;
      b2 = (b2 << 23 | b2 >>> 9) + c2 | 0;
      a2 += (c2 ^ (b2 | ~d2)) + k2[0] - 198630844 | 0;
      a2 = (a2 << 6 | a2 >>> 26) + b2 | 0;
      d2 += (b2 ^ (a2 | ~c2)) + k2[7] + 1126891415 | 0;
      d2 = (d2 << 10 | d2 >>> 22) + a2 | 0;
      c2 += (a2 ^ (d2 | ~b2)) + k2[14] - 1416354905 | 0;
      c2 = (c2 << 15 | c2 >>> 17) + d2 | 0;
      b2 += (d2 ^ (c2 | ~a2)) + k2[5] - 57434055 | 0;
      b2 = (b2 << 21 | b2 >>> 11) + c2 | 0;
      a2 += (c2 ^ (b2 | ~d2)) + k2[12] + 1700485571 | 0;
      a2 = (a2 << 6 | a2 >>> 26) + b2 | 0;
      d2 += (b2 ^ (a2 | ~c2)) + k2[3] - 1894986606 | 0;
      d2 = (d2 << 10 | d2 >>> 22) + a2 | 0;
      c2 += (a2 ^ (d2 | ~b2)) + k2[10] - 1051523 | 0;
      c2 = (c2 << 15 | c2 >>> 17) + d2 | 0;
      b2 += (d2 ^ (c2 | ~a2)) + k2[1] - 2054922799 | 0;
      b2 = (b2 << 21 | b2 >>> 11) + c2 | 0;
      a2 += (c2 ^ (b2 | ~d2)) + k2[8] + 1873313359 | 0;
      a2 = (a2 << 6 | a2 >>> 26) + b2 | 0;
      d2 += (b2 ^ (a2 | ~c2)) + k2[15] - 30611744 | 0;
      d2 = (d2 << 10 | d2 >>> 22) + a2 | 0;
      c2 += (a2 ^ (d2 | ~b2)) + k2[6] - 1560198380 | 0;
      c2 = (c2 << 15 | c2 >>> 17) + d2 | 0;
      b2 += (d2 ^ (c2 | ~a2)) + k2[13] + 1309151649 | 0;
      b2 = (b2 << 21 | b2 >>> 11) + c2 | 0;
      a2 += (c2 ^ (b2 | ~d2)) + k2[4] - 145523070 | 0;
      a2 = (a2 << 6 | a2 >>> 26) + b2 | 0;
      d2 += (b2 ^ (a2 | ~c2)) + k2[11] - 1120210379 | 0;
      d2 = (d2 << 10 | d2 >>> 22) + a2 | 0;
      c2 += (a2 ^ (d2 | ~b2)) + k2[2] + 718787259 | 0;
      c2 = (c2 << 15 | c2 >>> 17) + d2 | 0;
      b2 += (d2 ^ (c2 | ~a2)) + k2[9] - 343485551 | 0;
      b2 = (b2 << 21 | b2 >>> 11) + c2 | 0;
      x2[0] = a2 + x2[0] | 0;
      x2[1] = b2 + x2[1] | 0;
      x2[2] = c2 + x2[2] | 0;
      x2[3] = d2 + x2[3] | 0;
    }
    function md5blk(s2) {
      var md5blks = [], i2;
      for (i2 = 0; i2 < 64; i2 += 4) {
        md5blks[i2 >> 2] = s2.charCodeAt(i2) + (s2.charCodeAt(i2 + 1) << 8) + (s2.charCodeAt(i2 + 2) << 16) + (s2.charCodeAt(i2 + 3) << 24);
      }
      return md5blks;
    }
    function md5blk_array(a2) {
      var md5blks = [], i2;
      for (i2 = 0; i2 < 64; i2 += 4) {
        md5blks[i2 >> 2] = a2[i2] + (a2[i2 + 1] << 8) + (a2[i2 + 2] << 16) + (a2[i2 + 3] << 24);
      }
      return md5blks;
    }
    function md51(s2) {
      var n2 = s2.length, state = [1732584193, -271733879, -1732584194, 271733878], i2, length, tail, tmp, lo, hi2;
      for (i2 = 64; i2 <= n2; i2 += 64) {
        md5cycle(state, md5blk(s2.substring(i2 - 64, i2)));
      }
      s2 = s2.substring(i2 - 64);
      length = s2.length;
      tail = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
      for (i2 = 0; i2 < length; i2 += 1) {
        tail[i2 >> 2] |= s2.charCodeAt(i2) << (i2 % 4 << 3);
      }
      tail[i2 >> 2] |= 128 << (i2 % 4 << 3);
      if (i2 > 55) {
        md5cycle(state, tail);
        for (i2 = 0; i2 < 16; i2 += 1) {
          tail[i2] = 0;
        }
      }
      tmp = n2 * 8;
      tmp = tmp.toString(16).match(/(.*?)(.{0,8})$/);
      lo = parseInt(tmp[2], 16);
      hi2 = parseInt(tmp[1], 16) || 0;
      tail[14] = lo;
      tail[15] = hi2;
      md5cycle(state, tail);
      return state;
    }
    function md51_array(a2) {
      var n2 = a2.length, state = [1732584193, -271733879, -1732584194, 271733878], i2, length, tail, tmp, lo, hi2;
      for (i2 = 64; i2 <= n2; i2 += 64) {
        md5cycle(state, md5blk_array(a2.subarray(i2 - 64, i2)));
      }
      a2 = i2 - 64 < n2 ? a2.subarray(i2 - 64) : new Uint8Array(0);
      length = a2.length;
      tail = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
      for (i2 = 0; i2 < length; i2 += 1) {
        tail[i2 >> 2] |= a2[i2] << (i2 % 4 << 3);
      }
      tail[i2 >> 2] |= 128 << (i2 % 4 << 3);
      if (i2 > 55) {
        md5cycle(state, tail);
        for (i2 = 0; i2 < 16; i2 += 1) {
          tail[i2] = 0;
        }
      }
      tmp = n2 * 8;
      tmp = tmp.toString(16).match(/(.*?)(.{0,8})$/);
      lo = parseInt(tmp[2], 16);
      hi2 = parseInt(tmp[1], 16) || 0;
      tail[14] = lo;
      tail[15] = hi2;
      md5cycle(state, tail);
      return state;
    }
    function rhex(n2) {
      var s2 = "", j2;
      for (j2 = 0; j2 < 4; j2 += 1) {
        s2 += hex_chr[n2 >> j2 * 8 + 4 & 15] + hex_chr[n2 >> j2 * 8 & 15];
      }
      return s2;
    }
    function hex(x2) {
      var i2;
      for (i2 = 0; i2 < x2.length; i2 += 1) {
        x2[i2] = rhex(x2[i2]);
      }
      return x2.join("");
    }
    if (hex(md51("hello")) !== "5d41402abc4b2a76b9719d911017c592") ;
    if (typeof ArrayBuffer !== "undefined" && !ArrayBuffer.prototype.slice) {
      (function() {
        function clamp(val, length) {
          val = val | 0 || 0;
          if (val < 0) {
            return Math.max(val + length, 0);
          }
          return Math.min(val, length);
        }
        ArrayBuffer.prototype.slice = function(from, to2) {
          var length = this.byteLength, begin = clamp(from, length), end2 = length, num, target, targetArray, sourceArray;
          if (to2 !== undefined$1) {
            end2 = clamp(to2, length);
          }
          if (begin > end2) {
            return new ArrayBuffer(0);
          }
          num = end2 - begin;
          target = new ArrayBuffer(num);
          targetArray = new Uint8Array(target);
          sourceArray = new Uint8Array(this, begin, num);
          targetArray.set(sourceArray);
          return target;
        };
      })();
    }
    function toUtf8(str) {
      if (/[\u0080-\uFFFF]/.test(str)) {
        str = unescape(encodeURIComponent(str));
      }
      return str;
    }
    function utf8Str2ArrayBuffer(str, returnUInt8Array) {
      var length = str.length, buff = new ArrayBuffer(length), arr = new Uint8Array(buff), i2;
      for (i2 = 0; i2 < length; i2 += 1) {
        arr[i2] = str.charCodeAt(i2);
      }
      return returnUInt8Array ? arr : buff;
    }
    function arrayBuffer2Utf8Str(buff) {
      return String.fromCharCode.apply(null, new Uint8Array(buff));
    }
    function concatenateArrayBuffers(first, second, returnUInt8Array) {
      var result = new Uint8Array(first.byteLength + second.byteLength);
      result.set(new Uint8Array(first));
      result.set(new Uint8Array(second), first.byteLength);
      return returnUInt8Array ? result : result.buffer;
    }
    function hexToBinaryString(hex2) {
      var bytes = [], length = hex2.length, x2;
      for (x2 = 0; x2 < length - 1; x2 += 2) {
        bytes.push(parseInt(hex2.substr(x2, 2), 16));
      }
      return String.fromCharCode.apply(String, bytes);
    }
    function SparkMD52() {
      this.reset();
    }
    SparkMD52.prototype.append = function(str) {
      this.appendBinary(toUtf8(str));
      return this;
    };
    SparkMD52.prototype.appendBinary = function(contents) {
      this._buff += contents;
      this._length += contents.length;
      var length = this._buff.length, i2;
      for (i2 = 64; i2 <= length; i2 += 64) {
        md5cycle(this._hash, md5blk(this._buff.substring(i2 - 64, i2)));
      }
      this._buff = this._buff.substring(i2 - 64);
      return this;
    };
    SparkMD52.prototype.end = function(raw) {
      var buff = this._buff, length = buff.length, i2, tail = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], ret;
      for (i2 = 0; i2 < length; i2 += 1) {
        tail[i2 >> 2] |= buff.charCodeAt(i2) << (i2 % 4 << 3);
      }
      this._finish(tail, length);
      ret = hex(this._hash);
      if (raw) {
        ret = hexToBinaryString(ret);
      }
      this.reset();
      return ret;
    };
    SparkMD52.prototype.reset = function() {
      this._buff = "";
      this._length = 0;
      this._hash = [1732584193, -271733879, -1732584194, 271733878];
      return this;
    };
    SparkMD52.prototype.getState = function() {
      return {
        buff: this._buff,
        length: this._length,
        hash: this._hash.slice()
      };
    };
    SparkMD52.prototype.setState = function(state) {
      this._buff = state.buff;
      this._length = state.length;
      this._hash = state.hash;
      return this;
    };
    SparkMD52.prototype.destroy = function() {
      delete this._hash;
      delete this._buff;
      delete this._length;
    };
    SparkMD52.prototype._finish = function(tail, length) {
      var i2 = length, tmp, lo, hi2;
      tail[i2 >> 2] |= 128 << (i2 % 4 << 3);
      if (i2 > 55) {
        md5cycle(this._hash, tail);
        for (i2 = 0; i2 < 16; i2 += 1) {
          tail[i2] = 0;
        }
      }
      tmp = this._length * 8;
      tmp = tmp.toString(16).match(/(.*?)(.{0,8})$/);
      lo = parseInt(tmp[2], 16);
      hi2 = parseInt(tmp[1], 16) || 0;
      tail[14] = lo;
      tail[15] = hi2;
      md5cycle(this._hash, tail);
    };
    SparkMD52.hash = function(str, raw) {
      return SparkMD52.hashBinary(toUtf8(str), raw);
    };
    SparkMD52.hashBinary = function(content, raw) {
      var hash3 = md51(content), ret = hex(hash3);
      return raw ? hexToBinaryString(ret) : ret;
    };
    SparkMD52.ArrayBuffer = function() {
      this.reset();
    };
    SparkMD52.ArrayBuffer.prototype.append = function(arr) {
      var buff = concatenateArrayBuffers(this._buff.buffer, arr, true), length = buff.length, i2;
      this._length += arr.byteLength;
      for (i2 = 64; i2 <= length; i2 += 64) {
        md5cycle(this._hash, md5blk_array(buff.subarray(i2 - 64, i2)));
      }
      this._buff = i2 - 64 < length ? new Uint8Array(buff.buffer.slice(i2 - 64)) : new Uint8Array(0);
      return this;
    };
    SparkMD52.ArrayBuffer.prototype.end = function(raw) {
      var buff = this._buff, length = buff.length, tail = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], i2, ret;
      for (i2 = 0; i2 < length; i2 += 1) {
        tail[i2 >> 2] |= buff[i2] << (i2 % 4 << 3);
      }
      this._finish(tail, length);
      ret = hex(this._hash);
      if (raw) {
        ret = hexToBinaryString(ret);
      }
      this.reset();
      return ret;
    };
    SparkMD52.ArrayBuffer.prototype.reset = function() {
      this._buff = new Uint8Array(0);
      this._length = 0;
      this._hash = [1732584193, -271733879, -1732584194, 271733878];
      return this;
    };
    SparkMD52.ArrayBuffer.prototype.getState = function() {
      var state = SparkMD52.prototype.getState.call(this);
      state.buff = arrayBuffer2Utf8Str(state.buff);
      return state;
    };
    SparkMD52.ArrayBuffer.prototype.setState = function(state) {
      state.buff = utf8Str2ArrayBuffer(state.buff, true);
      return SparkMD52.prototype.setState.call(this, state);
    };
    SparkMD52.ArrayBuffer.prototype.destroy = SparkMD52.prototype.destroy;
    SparkMD52.ArrayBuffer.prototype._finish = SparkMD52.prototype._finish;
    SparkMD52.ArrayBuffer.hash = function(arr, raw) {
      var hash3 = md51_array(new Uint8Array(arr)), ret = hex(hash3);
      return raw ? hexToBinaryString(ret) : ret;
    };
    return SparkMD52;
  });
})(sparkMd5);
var SparkMD5 = sparkMd5.exports;
var fileSlice = File.prototype.slice || File.prototype.mozSlice || File.prototype.webkitSlice;
var FileChecksum = class _FileChecksum {
  static create(file, callback) {
    const instance = new _FileChecksum(file);
    instance.create(callback);
  }
  constructor(file) {
    this.file = file;
    this.chunkSize = 2097152;
    this.chunkCount = Math.ceil(this.file.size / this.chunkSize);
    this.chunkIndex = 0;
  }
  create(callback) {
    this.callback = callback;
    this.md5Buffer = new SparkMD5.ArrayBuffer();
    this.fileReader = new FileReader();
    this.fileReader.addEventListener("load", (event) => this.fileReaderDidLoad(event));
    this.fileReader.addEventListener("error", (event) => this.fileReaderDidError(event));
    this.readNextChunk();
  }
  fileReaderDidLoad(event) {
    this.md5Buffer.append(event.target.result);
    if (!this.readNextChunk()) {
      const binaryDigest = this.md5Buffer.end(true);
      const base64digest = btoa(binaryDigest);
      this.callback(null, base64digest);
    }
  }
  fileReaderDidError(event) {
    this.callback(`Error reading ${this.file.name}`);
  }
  readNextChunk() {
    if (this.chunkIndex < this.chunkCount || this.chunkIndex == 0 && this.chunkCount == 0) {
      const start4 = this.chunkIndex * this.chunkSize;
      const end2 = Math.min(start4 + this.chunkSize, this.file.size);
      const bytes = fileSlice.call(this.file, start4, end2);
      this.fileReader.readAsArrayBuffer(bytes);
      this.chunkIndex++;
      return true;
    } else {
      return false;
    }
  }
};
function getMetaValue(name) {
  const element = findElement(document.head, `meta[name="${name}"]`);
  if (element) {
    return element.getAttribute("content");
  }
}
function findElements(root, selector) {
  if (typeof root == "string") {
    selector = root;
    root = document;
  }
  const elements = root.querySelectorAll(selector);
  return toArray(elements);
}
function findElement(root, selector) {
  if (typeof root == "string") {
    selector = root;
    root = document;
  }
  return root.querySelector(selector);
}
function dispatchEvent2(element, type, eventInit = {}) {
  const { disabled } = element;
  const { bubbles, cancelable, detail } = eventInit;
  const event = document.createEvent("Event");
  event.initEvent(type, bubbles || true, cancelable || true);
  event.detail = detail || {};
  try {
    element.disabled = false;
    element.dispatchEvent(event);
  } finally {
    element.disabled = disabled;
  }
  return event;
}
function toArray(value) {
  if (Array.isArray(value)) {
    return value;
  } else if (Array.from) {
    return Array.from(value);
  } else {
    return [].slice.call(value);
  }
}
var BlobRecord = class {
  constructor(file, checksum, url, customHeaders = {}) {
    this.file = file;
    this.attributes = {
      filename: file.name,
      content_type: file.type || "application/octet-stream",
      byte_size: file.size,
      checksum
    };
    this.xhr = new XMLHttpRequest();
    this.xhr.open("POST", url, true);
    this.xhr.responseType = "json";
    this.xhr.setRequestHeader("Content-Type", "application/json");
    this.xhr.setRequestHeader("Accept", "application/json");
    this.xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
    Object.keys(customHeaders).forEach((headerKey) => {
      this.xhr.setRequestHeader(headerKey, customHeaders[headerKey]);
    });
    const csrfToken = getMetaValue("csrf-token");
    if (csrfToken != void 0) {
      this.xhr.setRequestHeader("X-CSRF-Token", csrfToken);
    }
    this.xhr.addEventListener("load", (event) => this.requestDidLoad(event));
    this.xhr.addEventListener("error", (event) => this.requestDidError(event));
  }
  get status() {
    return this.xhr.status;
  }
  get response() {
    const { responseType, response } = this.xhr;
    if (responseType == "json") {
      return response;
    } else {
      return JSON.parse(response);
    }
  }
  create(callback) {
    this.callback = callback;
    this.xhr.send(JSON.stringify({
      blob: this.attributes
    }));
  }
  requestDidLoad(event) {
    if (this.status >= 200 && this.status < 300) {
      const { response } = this;
      const { direct_upload } = response;
      delete response.direct_upload;
      this.attributes = response;
      this.directUploadData = direct_upload;
      this.callback(null, this.toJSON());
    } else {
      this.requestDidError(event);
    }
  }
  requestDidError(event) {
    this.callback(`Error creating Blob for "${this.file.name}". Status: ${this.status}`);
  }
  toJSON() {
    const result = {};
    for (const key in this.attributes) {
      result[key] = this.attributes[key];
    }
    return result;
  }
};
var BlobUpload = class {
  constructor(blob) {
    this.blob = blob;
    this.file = blob.file;
    const { url, headers } = blob.directUploadData;
    this.xhr = new XMLHttpRequest();
    this.xhr.open("PUT", url, true);
    this.xhr.responseType = "text";
    for (const key in headers) {
      this.xhr.setRequestHeader(key, headers[key]);
    }
    this.xhr.addEventListener("load", (event) => this.requestDidLoad(event));
    this.xhr.addEventListener("error", (event) => this.requestDidError(event));
  }
  create(callback) {
    this.callback = callback;
    this.xhr.send(this.file.slice());
  }
  requestDidLoad(event) {
    const { status, response } = this.xhr;
    if (status >= 200 && status < 300) {
      this.callback(null, response);
    } else {
      this.requestDidError(event);
    }
  }
  requestDidError(event) {
    this.callback(`Error storing "${this.file.name}". Status: ${this.xhr.status}`);
  }
};
var id = 0;
var DirectUpload = class {
  constructor(file, url, delegate, customHeaders = {}) {
    this.id = ++id;
    this.file = file;
    this.url = url;
    this.delegate = delegate;
    this.customHeaders = customHeaders;
  }
  create(callback) {
    FileChecksum.create(this.file, (error2, checksum) => {
      if (error2) {
        callback(error2);
        return;
      }
      const blob = new BlobRecord(this.file, checksum, this.url, this.customHeaders);
      notify(this.delegate, "directUploadWillCreateBlobWithXHR", blob.xhr);
      blob.create((error3) => {
        if (error3) {
          callback(error3);
        } else {
          const upload = new BlobUpload(blob);
          notify(this.delegate, "directUploadWillStoreFileWithXHR", upload.xhr);
          upload.create((error4) => {
            if (error4) {
              callback(error4);
            } else {
              callback(null, blob.toJSON());
            }
          });
        }
      });
    });
  }
};
function notify(object, methodName, ...messages) {
  if (object && typeof object[methodName] == "function") {
    return object[methodName](...messages);
  }
}
var DirectUploadController = class {
  constructor(input, file) {
    this.input = input;
    this.file = file;
    this.directUpload = new DirectUpload(this.file, this.url, this);
    this.dispatch("initialize");
  }
  start(callback) {
    const hiddenInput = document.createElement("input");
    hiddenInput.type = "hidden";
    hiddenInput.name = this.input.name;
    this.input.insertAdjacentElement("beforebegin", hiddenInput);
    this.dispatch("start");
    this.directUpload.create((error2, attributes) => {
      if (error2) {
        hiddenInput.parentNode.removeChild(hiddenInput);
        this.dispatchError(error2);
      } else {
        hiddenInput.value = attributes.signed_id;
      }
      this.dispatch("end");
      callback(error2);
    });
  }
  uploadRequestDidProgress(event) {
    const progress = event.loaded / event.total * 100;
    if (progress) {
      this.dispatch("progress", {
        progress
      });
    }
  }
  get url() {
    return this.input.getAttribute("data-direct-upload-url");
  }
  dispatch(name, detail = {}) {
    detail.file = this.file;
    detail.id = this.directUpload.id;
    return dispatchEvent2(this.input, `direct-upload:${name}`, {
      detail
    });
  }
  dispatchError(error2) {
    const event = this.dispatch("error", {
      error: error2
    });
    if (!event.defaultPrevented) {
      alert(error2);
    }
  }
  directUploadWillCreateBlobWithXHR(xhr) {
    this.dispatch("before-blob-request", {
      xhr
    });
  }
  directUploadWillStoreFileWithXHR(xhr) {
    this.dispatch("before-storage-request", {
      xhr
    });
    xhr.upload.addEventListener("progress", (event) => this.uploadRequestDidProgress(event));
  }
};
var inputSelector = "input[type=file][data-direct-upload-url]:not([disabled])";
var DirectUploadsController = class {
  constructor(form) {
    this.form = form;
    this.inputs = findElements(form, inputSelector).filter((input) => input.files.length);
  }
  start(callback) {
    const controllers = this.createDirectUploadControllers();
    const startNextController = () => {
      const controller = controllers.shift();
      if (controller) {
        controller.start((error2) => {
          if (error2) {
            callback(error2);
            this.dispatch("end");
          } else {
            startNextController();
          }
        });
      } else {
        callback();
        this.dispatch("end");
      }
    };
    this.dispatch("start");
    startNextController();
  }
  createDirectUploadControllers() {
    const controllers = [];
    this.inputs.forEach((input) => {
      toArray(input.files).forEach((file) => {
        const controller = new DirectUploadController(input, file);
        controllers.push(controller);
      });
    });
    return controllers;
  }
  dispatch(name, detail = {}) {
    return dispatchEvent2(this.form, `direct-uploads:${name}`, {
      detail
    });
  }
};
var processingAttribute = "data-direct-uploads-processing";
var submitButtonsByForm = /* @__PURE__ */ new WeakMap();
var started = false;
function start3() {
  if (!started) {
    started = true;
    document.addEventListener("click", didClick, true);
    document.addEventListener("submit", didSubmitForm, true);
    document.addEventListener("ajax:before", didSubmitRemoteElement);
  }
}
function didClick(event) {
  const button = event.target.closest("button, input");
  if (button && button.type === "submit" && button.form) {
    submitButtonsByForm.set(button.form, button);
  }
}
function didSubmitForm(event) {
  handleFormSubmissionEvent(event);
}
function didSubmitRemoteElement(event) {
  if (event.target.tagName == "FORM") {
    handleFormSubmissionEvent(event);
  }
}
function handleFormSubmissionEvent(event) {
  const form = event.target;
  if (form.hasAttribute(processingAttribute)) {
    event.preventDefault();
    return;
  }
  const controller = new DirectUploadsController(form);
  const { inputs } = controller;
  if (inputs.length) {
    event.preventDefault();
    form.setAttribute(processingAttribute, "");
    inputs.forEach(disable);
    controller.start((error2) => {
      form.removeAttribute(processingAttribute);
      if (error2) {
        inputs.forEach(enable);
      } else {
        submitForm(form);
      }
    });
  }
}
function submitForm(form) {
  let button = submitButtonsByForm.get(form) || findElement(form, "input[type=submit], button[type=submit]");
  if (button) {
    const { disabled } = button;
    button.disabled = false;
    button.focus();
    button.click();
    button.disabled = disabled;
  } else {
    button = document.createElement("input");
    button.type = "submit";
    button.style.display = "none";
    form.appendChild(button);
    button.click();
    form.removeChild(button);
  }
  submitButtonsByForm.delete(form);
}
function disable(input) {
  input.disabled = true;
}
function enable(input) {
  input.disabled = false;
}
function autostart() {
  if (window.ActiveStorage) {
    start3();
  }
}
setTimeout(autostart, 1);
var AttachmentUpload = class {
  constructor(attachment, element) {
    this.attachment = attachment;
    this.element = element;
    this.directUpload = new DirectUpload(attachment.file, this.directUploadUrl, this);
  }
  start() {
    this.directUpload.create(this.directUploadDidComplete.bind(this));
    this.dispatch("start");
  }
  directUploadWillStoreFileWithXHR(xhr) {
    xhr.upload.addEventListener("progress", (event) => {
      const progress = event.loaded / event.total * 100;
      this.attachment.setUploadProgress(progress);
      if (progress) {
        this.dispatch("progress", {
          progress
        });
      }
    });
  }
  directUploadDidComplete(error2, attributes) {
    if (error2) {
      this.dispatchError(error2);
    } else {
      this.attachment.setAttributes({
        sgid: attributes.attachable_sgid,
        url: this.createBlobUrl(attributes.signed_id, attributes.filename)
      });
      this.dispatch("end");
    }
  }
  createBlobUrl(signedId, filename) {
    return this.blobUrlTemplate.replace(":signed_id", signedId).replace(":filename", encodeURIComponent(filename));
  }
  dispatch(name, detail = {}) {
    detail.attachment = this.attachment;
    return dispatchEvent2(this.element, `direct-upload:${name}`, {
      detail
    });
  }
  dispatchError(error2) {
    const event = this.dispatch("error", {
      error: error2
    });
    if (!event.defaultPrevented) {
      alert(error2);
    }
  }
  get directUploadUrl() {
    return this.element.dataset.directUploadUrl;
  }
  get blobUrlTemplate() {
    return this.element.dataset.blobUrlTemplate;
  }
};
addEventListener("trix-attachment-add", (event) => {
  const { attachment, target } = event;
  if (attachment.file) {
    const upload = new AttachmentUpload(attachment, target);
    upload.start();
  }
});
/*! Bundled license information:

@hotwired/turbo/dist/turbo.es2017-esm.js:
  (*!
  Turbo 8.0.13
  Copyright © 2025 37signals LLC
   *)

bootstrap/dist/js/bootstrap.esm.js:
  (*!
    * Bootstrap v5.3.5 (https://getbootstrap.com/)
    * Copyright 2011-2025 The Bootstrap Authors (https://github.com/twbs/bootstrap/graphs/contributors)
    * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
    *)

trix/dist/trix.esm.min.js:
  (*! @license DOMPurify 3.2.3 | (c) Cure53 and other contributors | Released under the Apache license 2.0 and Mozilla Public License 2.0 | github.com/cure53/DOMPurify/blob/3.2.3/LICENSE *)
*/
//# sourceMappingURL=/assets/application.js.map
