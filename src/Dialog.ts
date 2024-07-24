import { AChildren, ACustomComponentEvent, AElementComponentWithInternalUI, ComponentFactory, DEFAULT_CANCELABLE_EVENT_INIT_DICT, INodeComponent, mixin } from "@vanilla-ts/core";
import { Div, Dialog as DOMDialog } from "@vanilla-ts/dom";


/**
 * Options for instances of 'Dialog'.
 */
export type DialogOptions = {
    /**
     * The left/top dialog position with regard to the viewport. This is done setting the
     * `margin-left` and `margin-top` CSS properties on the dialog element.\
     * Default: `{ x: 0, y: 0 }`.
     */
    Position?: DOMPoint;
    /**
     * `true` if the dialog is to be centered horizontally, otherwise `false`. If `Position` is also
     * given, `Position.x` is added as an offset to the calculated value of the horizontally
     * centered position.\
     * Default: `true`.
     */
    HCentered?: boolean;
    /**
     * `true` if the dialog is to be centered vertically, otherwise `false`. If `Position` is also
     * given, `Position.y` is added as an offset to the calculated value of the vertically centered
     * position.\
     * Default: `true`.
     */
    VCentered?: boolean;
    /**
     * If `true`, the dialog is closed when the `Esc` key is pressed. With `false` the dialog must
     * be closed by other means (e.g. a button action or by calling `dlg.close()` elsewhere).\
     * Default: `true`.
     */
    CloseWithEscape?: boolean;
    /**
     * If `true`, the focus remains within the dialog when switching with the `Tab` and `Shift-Tab`
     * keys, i.e. if e.g. `Tab` is pressed when the last focusable element is focused, the focus
     * will move to the first focusable element in the dialog and not to another element on the page
     * or to the browser itself.\
     * Default: `true`.
     */
    LockFocusCycleInside?: boolean;
};

/**
 * State of a dialog.
 */
export enum DialogState {
    /** The dialog is not showing (closed). */
    Closed = 0,
    /** The dialog is shown non-modally. */
    NON_MODAL = 1,
    /** The dialog is shown modally. */
    MODAL = 2
}

/**
 * Custom 'dlg-show' event for dialogs.
 */
export class DialogShowEvent extends ACustomComponentEvent<"dlg-show", Dialog, {
    /** `true` if the dialog is about to be displayed modal, otherwise false. */
    Modal: boolean;
}> {
    /**
     * Create dialog show event.
     * @param sender The event emitter (always `Dialog`).
     * @param modal `true` if the dialog is about to be displayed modal, otherwise false.
     * @param customEventInitDict Optional event properties.
     */
    constructor(sender: Dialog, modal: boolean, customEventInitDict: EventInit = DEFAULT_CANCELABLE_EVENT_INIT_DICT) {
        super("dlg-show", sender, { Modal: modal }, customEventInitDict); // eslint-disable-line jsdoc/require-jsdoc
    }
}

/**
 * Custom 'dlg-close' event for dialogs.
 */
export class DialogCloseEvent extends ACustomComponentEvent<"dlg-close", Dialog> {
    /**
     * Create dialog close event.
     * @param sender The event emitter (always `Dialog`).
     * @param customEventInitDict Optional event properties.
     */
    constructor(sender: Dialog, customEventInitDict: EventInit = DEFAULT_CANCELABLE_EVENT_INIT_DICT) {
        super("dlg-close", sender, undefined, customEventInitDict);
    }
}

/**
 * Additional event(s) for `Dialog`.
 */
export interface DialogEventMap extends HTMLElementEventMap {
    /**
     * A dialog is to be shown. Event handlers can prevent showing the dialog by calling
     * `preventDefault()`.
     */
    "dlg-show": DialogShowEvent;
    /**
     * A dialog is to be colsed. Event handlers can prevent closing the dialog by calling
     * `preventDefault()`.
     */
    "dlg-close": DialogCloseEvent;
}

/**
 * Dialog component for displaying modal and non-modal dialogs.
 */
export class Dialog<EventMap extends DialogEventMap = DialogEventMap> extends AElementComponentWithInternalUI<DOMDialog, EventMap> { // eslint-disable-line @typescript-eslint/no-unsafe-declaration-merging
    protected dlg: DOMDialog;
    protected _options: DialogOptions = {};
    protected fncOnKeyDown = this.onKeyDown.bind(this);
    protected modalResolver: (value?: unknown) => void;
    protected state: DialogState = DialogState.Closed;
    protected contentContainer: Div;
    protected focusableElementsSelector = "button:not([tabindex='-1']), [href], input:not([tabindex='-1']), select:not([tabindex='-1']), textarea:not([tabindex='-1']), details:not([tabindex='-1']), [tabindex]:not([tabindex='-1'])";

    /**
     * Create dialog component.\
     * __Note:__ In contrast to the vast majority of other components, instances of `Dialog` usually
     * should not be mounted in another component (with `append()`) since this can cause problems
     * when centering or positioning the dialog relative to the viewport. If an instance of `Dialog`
     * is not mounted in another component, it is automatically added to `document.body` as a child
     * element in `show()`/`showModal()` and removed again in `close()`.
     * @param options Options for the dialog.
     * @param components The initial components that make up the content of this dialog.\
     * __Important note:__ If a dialog is disposed of (using`dispose()`), _all_ components given
     * in the constructor that are still children of this dialog (`Dialog` implements `IChildren`)
     * are also disposed of! If these components are to be used elsewhere after the dialog has been
     * disposed of, they must be extracted or removed using `dlg.extract(...)` or `dlg.remove()`
     * before the dialog is disposed of!
     */
    constructor(options?: DialogOptions, ...components: INodeComponent<Node>[]) {
        super();
        super
            .initialize()
            .options(options ?? {})
            .append(...components)
            .on("keydown", this.fncOnKeyDown);
    }

    /**
     * Get/set the options for this dialog. The getter returns a _copy_ of the options.
     */
    public get Options(): DialogOptions {
        return structuredClone(this._options);
    }
    /** @inheritdoc */
    public set Options(v: DialogOptions) {
        this.options(v);
    }

    /**
     * Set the options for this dialog.
     * @param options Options for this dialog.
     * @returns This instance.
     */
    public options(options: DialogOptions): this {
        this._options = {
            /* eslint-disable jsdoc/require-jsdoc */
            Position: options.Position ? DOMPoint.fromPoint(options.Position) : this._options.Position ? DOMPoint.fromPoint(this._options.Position) : new DOMPoint(0, 0),
            HCentered: options.HCentered ?? this._options.HCentered ?? true,
            VCentered: options.VCentered ?? this._options.VCentered ?? true,
            CloseWithEscape: options.CloseWithEscape ?? this._options.CloseWithEscape ?? true,
            LockFocusCycleInside: options.LockFocusCycleInside ?? this._options.LockFocusCycleInside ?? true,
            /* eslint-enable */
        };
        this.style("marginLeft", `${this._options.Position!.x}px`);
        this.style("marginTop", `${this._options.Position!.y}px`);
        this._options.HCentered ? this.addClass("h-centered") : this.removeClass("h-centered");
        this._options.VCentered ? this.addClass("v-centered") : this.removeClass("v-centered");
        return this;
    }

    /**
     * Get the state of this dialog.
     */
    public get State(): DialogState {
        return this.state;
    }

    /**
     * Get/set the `returnValue` property of the dialog.
     */
    public get ReturnValue(): string {
        return this.dlg.ReturnValue;
    }
    /** @inheritdoc */
    public set ReturnValue(v: string) {
        this.dlg.ReturnValue = v;
    }

    /**
     * Set the `returnValue` property of the dialog.
     * @param v The value to be set.
     * @returns This instance.
     */
    public returnValue(v: string): this {
        this.dlg.ReturnValue = v;
        return this;
    }

    /**
     * Closes the dialog.
     * @param returnValue An updated value for the `returnValue` of the dialog.
     * @returns This instance.
     */
    public close(returnValue?: string): this {
        if (this.dispatch(new DialogCloseEvent(this))) {
            this.ui.close(returnValue);
            this.modalResolver?.();
            if (!this.Parent) {
                this.DOM.remove();
            }
            this.state = DialogState.Closed;
        }
        return this;
    }

    /**
     * Displays the dialog (non-modal).
     * @throws `InvalidStateError` (if the dialog is already open and modal).
     * @returns This instance.
     */
    public show(): this {
        if (this.dispatch(new DialogShowEvent(this, false))) {
            if (!this.Parent) {
                document.body.appendChild(this.DOM);
            }
            this.ui.show();
            this.state = DialogState.NON_MODAL;
        }
        return this;
    }

    /**
     * Displays the dialog (modal).
     * @throws `InvalidStateError` (if the dialog is already open and non-modal).
     * @returns This instance.
     */
    public async showModal(): Promise<this> {
        if (this.dispatch(new DialogShowEvent(this, true))) {
            if (!this.Parent) {
                document.body.appendChild(this.DOM);
            }
            this.ui.showModal();
            this.state = DialogState.MODAL;
            await new Promise(resolve => this.modalResolver = resolve);
        }
        return this;
    }

    /**
     * Keyboard handling for the dialog.
     * @param ev The keyboard event.
     */
    protected onKeyDown(ev: KeyboardEvent): void {
        switch (ev.key) {
            // case "Enter":
            //     break;
            case "Escape":
                ev.preventDefault();
                ev.stopImmediatePropagation();
                if (this._options.CloseWithEscape) {
                    this.close();
                }
                break;
            case "Tab":
                if (this._options.LockFocusCycleInside && !ev.ctrlKey && !ev.altKey && !ev.metaKey) {
                    const focusableElements = this.dlg.DOM.querySelectorAll(this.focusableElementsSelector);
                    const firstFocusableElement = <HTMLElement>focusableElements[0];
                    const lastFocusableElement = <HTMLElement>focusableElements[focusableElements.length - 1];
                    if (ev.shiftKey) {
                        if (ev.target === firstFocusableElement) {
                            ev.preventDefault();
                            ev.stopImmediatePropagation();
                            lastFocusableElement?.focus?.();
                        }
                    } else {
                        if (ev.target === lastFocusableElement) {
                            ev.preventDefault();
                            ev.stopImmediatePropagation();
                            firstFocusableElement?.focus?.();
                        }
                    }
                }
                break;
            default:
                return;
        }
    }

    /**
     * Build UI of the component.
     * @returns This instance.
     */
    protected buildUI() {
        this.dlg = new DOMDialog()
            .append(
                this.contentContainer = new Div()
                    .addClass("content")
            );
        this.ui = this.dlg;
        // Set target DOM for the `IChildren` mixin!!
        this.setChildrenDOMTarget(this.contentContainer.DOM);
        return this;
    }

    static {
        /** Mixin the IChildren implementation (which targets `this.contentContainer`). */
        mixin(false, Dialog, AChildren);
    }
}

/** Augment class definition with `IChildren` (see `static`). */
export interface Dialog<EventMap extends DialogEventMap = DialogEventMap> extends AElementComponentWithInternalUI<DOMDialog, EventMap>, AChildren<HTMLElement, EventMap> { }

/**
 * Factory for Dialog components.
 */
export class DialogFactory<T> extends ComponentFactory<Dialog> {
    /**
     * Create, set up and return Dialog component.\
     * __Note:__ In contrast to the vast majority of other components, instances of `Dialog` do not
     * have to be mounted in another component to be displayed (when calling `show()` or
     * `showModal()`). If an instance of `Dialog` is not mounted in another component, it is
     * automatically added to `document.body` as a child element in `show()`/`showModal()` and
     * removed again in `close()`. For semantic reasons, however, it is recommended to mount
     * instances of `Dialog` in a suitable component (with `append()`).
     * @param options Options for the dialog.
     * @param components The initial components that make up the content of this dialog.\
     * __Important note:__ If a dialog is disposed of (using`dispose()`), _all_ components given
     * in the constructor that are still children of this dialog (`Dialog` implements `IChildren`)
     * are also disposed of! If these components are to be used elsewhere after the dialog has been
     * disposed of, they must be extracted or removed using `dlg.extract(...)` or `dlg.remove()`
     * before the dialog is disposed of!
     * @param data Optional arbitrary data passed to the `setupComponent()` function of the factory.
     * @returns Dialog component.
     */
    public dialog(options: DialogOptions | undefined = undefined, components: INodeComponent<Node>[] = [], data?: T): Dialog {
        return this.setupComponent(new Dialog(options, ...components), data);
    }
}
