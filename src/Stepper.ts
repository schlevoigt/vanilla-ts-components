import { ACustomComponentEvent, AElementComponentWithInternalUI, ComponentFactory, DEFAULT_CANCELABLE_EVENT_INIT_DICT } from "@vanilla-ts/core";
import { Button, Div } from "@vanilla-ts/dom";


/**
 * Interface that must be implemented by objects in order to enable stepping/navigation in an object
 * with an instance of `Stepper`.
 */
export interface ISteppable {
    /**
     * Current number of entries in the 'steppable' object.
     */
    Count: number;
    /**
     * Current position in the steppable object. The property must be readable _and_ writable; on
     * writing the object must set its current position accordingly. `Index` must also be an integer
     * value!
     */
    Index: number;
    /**
     * Number of elements to step backwards/forwards on step-by-page operations. Implementors can
     * return `-1` if no page-by-page stepping is or should be supported. A call to `Backward()` or
     * `Forward()` on an instance of `Stepper then has no effect. `PageSize` must also be an integer
     * value!
     */
    PageSize: number;
}

/**
 * Appearance of a stepper.
 */
export enum StepperAppearance {
    /**
     * Horizontal arrangement of the stepper buttons.
     */
    HORIZONTAL = 0,
    /**
     * Alternative horizontal arrangement of the stepper buttons (e.g. buttons rotated by 90°).
     */
    HORIZONTAL_ALT = 1,
    /**
     * Vertical arrangement of the stepper buttons.
     */
    VERTICAL = 2,
    /**
     * Alternative vertical arrangement of the stepper buttons (e.g. buttons rotated by 90°).
     */
    VERTICAL_ALT = 3
}

/**
 * `Stepper` options.
 */
export type StepperOptions = {
    /** Apperance of the stepper. */
    Apperance?: StepperAppearance;
    /** 
     * If `true`, buttons that cannot be used (e.g. the `First` button with `Index === 0`) are
     * hidden (`visibility: hidden;`) instead of just deactivated. 
     */
    HideButtons?: boolean;
    /** Timings for a held down pointer/mouse button. */
    // Continuous?: OnHeldDownOptions;
    /** Show button 'First'? Default: `true`. */
    First?: boolean;
    /** Tooltip for button 'First'. Default: `undefined`. */
    FirstTitle?: string;
    /** Show button 'Page back'? Default: `false`. */
    PageBackward?: boolean;
    /** Support for holding the pointer down on 'Page backward'? */
    PageBackwardContinuous?: boolean;
    /** Tooltip for button 'Page back'. Default: `undefined`. */
    PageBackwardTitle?: string;
    /** Show button 'Backward'? Default: `true`. */
    Backward?: boolean;
    /** Support for holding the pointer down on 'Backward'? */
    BackwardContinuous?: boolean;
    /** Tooltip for button 'Backward'. Default: `undefined`. */
    BackwardTitle?: string;
    /** Show button 'Forward'? Default: `true`. */
    Forward?: boolean;
    /** Support for holding the pointer down on 'Forward'? */
    ForwardContinuous?: boolean;
    /** Tooltip for button 'Forward'. Default: `undefined`. */
    ForwardTitle?: string;
    /** Show button 'Page forward'? Default: `false`. */
    PageForward?: boolean;
    /** Support for holding the pointer down on 'Page forward'? */
    PageForwardContinuous?: boolean;
    /** Tooltip for button 'Page forward'. Default: `undefined`. */
    PageForwardTitle?: string;
    /** Show button 'Last'? Default: `true`. */
    Last?: boolean;
    /** Tooltip for button 'Last'. Default: `undefined`. */
    LastTitle?: string;
};

/**
 * Custom 'step' event for steppers.
 */
export class StepEvent extends ACustomComponentEvent<"step", Stepper, {
    /** The new index/position in the steppable object. */
    Index: number;
}> {
    /**
     * Create StepEvent event.
     * @param sender The event emitter (always `Stepper`).
     * @param index The new index to which the current index/position in the steppable object is to
     * be moved.
     * @param customEventInitDict Optional event properties.
     */
    constructor(sender: Stepper, index: number, customEventInitDict: EventInit = DEFAULT_CANCELABLE_EVENT_INIT_DICT) {
        super("step", sender, { Index: index }, customEventInitDict); // eslint-disable-line jsdoc/require-jsdoc
    }
}

/**
 * Additional event(s) for `Stepper`.
 */
export interface StepperEventMap extends HTMLElementEventMap {
    /** 
     * The stepper wants to go to a new index/position in the steppable object. Event handlers can
     * prevent changing the index/position by calling `preventDefault()`.
     */
    "step": StepEvent;
}

/**
 * Stepper component.
 */
export class Stepper<EventMap extends StepperEventMap = StepperEventMap> extends AElementComponentWithInternalUI<Div, EventMap> {
    protected steppable: ISteppable;
    protected opts: StepperOptions;
    protected btnFirst: Button;
    protected btnPageBackward: Button;
    protected btnBackward: Button;
    protected btnForward: Button;
    protected btnPageForward: Button;
    protected btnLast: Button;
    protected fncFirst = this.First.bind(this);
    protected fncPageBackward = this.PageBackward.bind(this);
    protected fncBackward = this.Backward.bind(this);
    protected fncForward = this.Forward.bind(this);
    protected fncPageForward = this.PageForward.bind(this);
    protected fncLast = this.Last.bind(this);

    /**
     * Create stepper component.
     * @param steppable An object that imüplements `ISteppable`.
     * @param options Options for the stepper.
     */
    constructor(steppable: ISteppable, options?: StepperOptions) {
        super();
        this.steppable = steppable;
        super
            .initialize()
            .createButtons()
            .options(options ?? {});
    }

    /**
     * Get/set the stepper options. The returned object is a _copy_, modifying this copy has no
     * effect on the corresponding stepper instance.
     */
    public get Options(): StepperOptions {
        return {
            ...this.opts,
            // Continuous: { ...this.options.Continuous } // eslint-disable-line jsdoc/require-jsdoc
        };
    }
    /** @inheritdoc */
    public set Options(v: StepperOptions) {
        this.options(v);
    }

    /**
     * Sets the options for the stepper.
     * @param options The new stepper options.
     * @returns This instance.
     */
    public options(options: StepperOptions) {
        this.opts = {
            /* eslint-disable jsdoc/require-jsdoc */
            Apperance: options.Apperance ?? StepperAppearance.HORIZONTAL,
            HideButtons: options.HideButtons ?? false,
            // Leeres Objekt verwendet Default-Einstellung aus `Control.ts`.
            // Continuous: options.Continuous ?? {},
            First: options.First ?? true,
            FirstTitle: options.FirstTitle,
            PageBackward: options.PageBackward ?? false,
            PageBackwardContinuous: options.PageBackwardContinuous ?? false,
            PageBackwardTitle: options.PageBackwardTitle,
            Backward: options.Backward ?? true,
            BackwardContinuous: options.BackwardContinuous ?? true,
            BackwardTitle: options.BackwardTitle,
            Forward: options.Forward ?? true,
            ForwardContinuous: options.ForwardContinuous ?? true,
            ForwardTitle: options.ForwardTitle,
            PageForward: options.PageForward ?? false,
            PageForwardContinuous: options.PageForwardContinuous ?? false,
            PageForwardTitle: options.PageForwardTitle,
            Last: options.Last ?? true,
            LastTitle: options.LastTitle
            /* eslint-enable */
        };
        const buttons: Button[] = [];
        this.ui.remove();
        this.opts.First ? buttons.push(this.btnFirst) : undefined;
        this.btnFirst.Title = this.opts.FirstTitle ?? null;
        this.opts.PageBackward ? buttons.push(this.btnPageBackward) : undefined;
        // this.btnBackward.OnHeldDown = this.options.BackwardContinuous ? this.fncBackward : undefined;
        // this.btnBackward.OnHeldDownOptions = this.options.Continuous;
        this.btnPageBackward.Title = this.opts.PageBackwardTitle ?? null;
        this.opts.Backward ? buttons.push(this.btnBackward) : undefined;
        // this.btnPrevious.OnHeldDown = this.options.PreviousContinuous ? this.fncPrevious : undefined;
        // this.btnPrevious.OnHeldDownOptions = this.options.Continuous;
        this.btnBackward.Title = this.opts.BackwardTitle ?? null;
        this.opts.Forward ? buttons.push(this.btnForward) : undefined;
        // this.btnNext.OnHeldDown = this.options.NextContinuous ? this.fncNext : undefined;
        // this.btnNext.OnHeldDownOptions = this.options.Continuous;
        this.btnForward.Title = this.opts.ForwardTitle ?? null;
        this.opts.PageForward ? buttons.push(this.btnPageForward) : undefined;
        // this.btnForward.OnHeldDown = this.options.ForwardContinuous ? this.fncForward : undefined;
        // this.btnForward.OnHeldDownOptions = this.options.Continuous;
        this.btnPageForward.Title = this.opts.PageForwardTitle ?? null;
        this.opts.Last ? buttons.push(this.btnLast) : undefined;
        this.btnLast.Title = this.opts.LastTitle ?? null;
        this.ui.append(...buttons);
        this.appearance(this.opts.Apperance!);
        this.updateButtons(this.steppable.Index, this.steppable.Count);
        return this;
    }

    /**
     * Get/set the appearance of the stepper.
     */
    public get Appearance(): StepperAppearance {
        return this.opts.Apperance!;
    }
    /** @inheritdoc */
    public set Appearance(v: StepperAppearance) {
        this.appearance(v);
    }

    /**
     * Set the appearance of the stepper.
     * @param appearance The new appearance of the stepper.
     * @returns This instance.
     */
    public appearance(appearance: StepperAppearance): this {
        this.opts.Apperance = appearance;
        this.ui.removeClass("horizontal", "horizontal-alt", "vertical", "vertical-alt");
        switch (appearance) {
            case StepperAppearance.HORIZONTAL_ALT:
                this.ui.addClass("horizontal-alt");
                break;
            case StepperAppearance.VERTICAL:
                this.ui.addClass("vertical");
                break;
            case StepperAppearance.VERTICAL_ALT:
                this.ui.addClass("vertical-alt");
                break;
            default:
                this.ui.addClass("horizontal");
        }
        return this;
    }

    /**
     * Get the current number of entries in the steppable object.
     */
    public get Count(): number {
        return this.steppable.Count;
    }

    /**
     * Get the number of elements of a 'page' in the steppable object.
     */
    public get PageSize(): number {
        return this.steppable.PageSize;
    }

    /**
     * Get/set current index of the steppable object.
     */
    public get Index(): number {
        return this.steppable.Index;
    }
    /** @inheritdoc */
    public set Index(v: number) {
        this.index(v);
    }

    /**
     * Sets the index/position in the steppable object to a new value.\
     * __Notes:__
     * - If the index/position does not differ from the current index, the setter of `Index` on the
     *   steppable object isn't called!
     * - If the index/position is lower than `0` or greater or equal to `Count` of the steppable
     *   object it will always be corrected be in the range of `0`...`Count - 1`.
     * @param index The index/position to step to in the steppable object.
     * @returns `true` if no event handler has cancelled the `step` event and if the index/position
     * in the steppable object could be set to the required value, otherwise `false`. `false` is
     * also returned, if `Count` of the steppable object is `0`.
     */
    public index(index: number): boolean {
        return this.dispatch(new StepEvent(this, index))
            ? this.internalSetIndex(0)
            : false;
    }

    /**
     * Called internally by all functions that change the index in the steppable object.
     * @see `index()`.
     */
    /* eslint-disable-next-line jsdoc/require-jsdoc */
    protected internalSetIndex(index: number): boolean {
        const count = this.steppable.Count;
        const oldIndex = this.steppable.Index;
        if (count === 0) {
            return false;
        }
        const newIndex = index < 0
            ? 0
            : index >= count
                ? count - 1
                : Math.trunc(index);
        if (newIndex === oldIndex) {
            return true;
        }
        this.steppable.Index = newIndex;
        this.updateButtons(this.steppable.Index, this.steppable.Count);
        return this.steppable.Index === newIndex;
    }

    /**
     * Get all buttons of the stepper. The returned array always contains _all_ buttons of the
     * stepper, regardless of whether they are displayed or not. The order of the buttons in the
     * array is also always the same: `First`, `PageBackward`, `Backward`, `Forward`, `PageForward`
     * and `Last`.
     */
    public get Buttons(): [Button, Button, Button, Button, Button, Button] {
        return [
            this.btnFirst, this.btnPageBackward, this.btnBackward,
            this.btnForward, this.btnPageForward, this.btnLast
        ];
    }

    /**
     * Go to index/position `0` of the steppable object.
     * @returns `true` if no event handler has cancelled the `step` event and the index/position in
     * the steppable object is set to `0` after stepping, otherwise `false`. `false` is also
     * returned, if `Count` of the steppable object is `0`.\
     * __Note:__ The setter `Index` on the steppable object is never called, if the operation
     * wouldn't change its value.
     */
    public First(): boolean {
        return this.dispatch(new StepEvent(this, 0))
            ? this.internalSetIndex(0)
            : false;
    }

    /**
     * Go backward one 'page' in the steppable object.
     * @returns `true` if no event handler has cancelled the `step` event and if the index/position
     * in the steppable object is set to `Index - PageSize` or `0` after stepping, otherwise
     * `false`. `false` is also returned if the property `PageSize` in the steppable object is `-1`
     * (the object doesn't support paging) or if `Count` of the steppable object is `0`.\
     * __Notes:__
     * - The setter `Index` on the steppable object is never called, if the operation wouldn't
     *   change its value.
     * - If `PageSize` is greater than or equal to the current distance to `0`, `Index` will be set
     *   to `0`.
     */
    public PageBackward(): boolean {
        const pageSize = Math.trunc(this.steppable.PageSize);
        if (pageSize === -1) {
            return false;
        }
        return this.dispatch(new StepEvent(this, this.adjustIndex(this.steppable.Index - pageSize)))
            ? this.internalSetIndex(this.steppable.Index - pageSize)
            : false;
    }

    /**
     * Go backward one position in the steppable object.
     * @returns `true` if no event handler has cancelled the `step` event and if the index/position
     * in the steppable object is set to `Index - 1` after stepping, otherwise `false`. `false` is
     * also returned, if `Count` of the steppable object is `0`.\
     * __Note:__ The setter `Index` on the steppable object is never called, if the operation
     * wouldn't change its value.
     */
    public Backward(): boolean {
        return this.dispatch(new StepEvent(this, this.adjustIndex(this.steppable.Index - 1)))
            ? this.internalSetIndex(this.steppable.Index - 1)
            : false;
    }

    /**
     * Go forward one position in the steppable object.
     * @returns `true` if no event handler has cancelled the `step` event and if the index/position
     * in the steppable object is set to `Index + 1` after stepping, otherwise `false`. `false` is
     * also returned, if `Count` of the steppable object is `0`.\
     * __Note:__ The setter `Index` on the steppable object is never called, if the operation
     * wouldn't change its value.
     */
    public Forward(): boolean {
        return this.dispatch(new StepEvent(this, this.adjustIndex(this.steppable.Index + 1)))
            ? this.internalSetIndex(this.steppable.Index + 1)
            : false;
    }

    /**
     * Go forward one 'page' in the steppable object.
     * @returns `true` if no event handler has cancelled the `step` event and if the index/position
     * in the steppable object is set to `Index - PageSize` or `Count - 1` after stepping, otherwise
     * `false`. `false` is also returned if the property `PageSize` in the steppable object is `-1`
     * (the object doesn't support paging) or if `Count` of the steppable object is `0`.\
     * __Notes:__
     * - The setter `Index` on the steppable object is never called, if the operation wouldn't
     *   change its value.
     * - If `PageSize` is greater than or equal to the current distance to `Count - 1`,
     *   `Index` will be set to `Count - 1`.
     */
    public PageForward(): boolean {
        const pageSize = Math.trunc(this.steppable.PageSize);
        if (pageSize === -1) {
            return false;
        }
        return this.dispatch(new StepEvent(this, this.adjustIndex(this.steppable.Index + pageSize)))
            ? this.internalSetIndex(this.steppable.Index + pageSize)
            : false;
    }

    /**
     * Go to index/position `Count - 1` of the steppable object.
     * @returns `true` if no event handler has cancelled the `step` event and the index/position in
     * the steppable object is set to `Count - 1` after stepping, otherwise `false`. `false` is also
     * returned, if `Count` of the steppable object is `0`.\
     * __Note:__ The setter `Index` on the steppable object is never called, if the operation
     * wouldn't change its value.
     */
    public Last(): boolean {
        return this.dispatch(new StepEvent(this, this.adjustIndex(this.steppable.Count - 1)))
            ? this.internalSetIndex(this.steppable.Count - 1)
            : false;
    }

    /**
     * Synchronizes the stepper with the steppable object. This function _must_ always be called by
     * the steppable object when the current index/position or the number of elements in it changes!
     * This is particularly necessary for changes to the index/position that were _not_ triggered by
     * this stepper instance (e.g. by navigating with the keyboard in a table).
     */
    public sync(): void {
        this.updateButtons(this.steppable.Index, this.steppable.Count);
    }

    /**
     * Checks and adjusts an index value against the limits of `this.steppable`.
     * @param index The index to be checked.
     * @returns An index in the range `0 >= index <= this.steppable.Count-1`.
     */
    protected adjustIndex(index: number): number {
        return Math.min(Math.max(index, 0), this.steppable.Count - 1);
    }

    /**
     * Build UI of the component.
     * @returns This instance.
     */
    protected buildUI() {
        this.ui = new Div();
        return this;
    }

    /**
     * Create all stepper buttons.
     * @returns This instance.
     */
    protected createButtons(): this {
        this.btnFirst = new Button()
            .addClass("first")
            .on("click", this.fncFirst);
        this.btnPageBackward = new Button()
            .addClass("page-backward")
            .on("click", this.fncPageBackward);
        this.btnBackward = new Button()
            .addClass("backward")
            .on("click", this.fncBackward);
        this.btnForward = new Button()
            .addClass("forward")
            .on("click", this.fncForward);
        this.btnPageForward = new Button()
            .addClass("page-forward")
            .on("click", this.fncPageForward);
        this.btnLast = new Button()
            .addClass("last")
            .on("click", this.fncLast);
        return this;
    }

    /**
     * Updates the buttons in the stepper to match the status of the steppable object.
     * @param index The current index of the steppable object.
     * @param count The current number of entries in the steppable object.
     */
    protected updateButtons(index: number, count: number): void {
        const isAtBegin = (count <= 0) || (index <= 0);
        const isAtEnd = (count <= 0) || (index >= count - 1);
        if (this.opts.HideButtons) {
            this.btnFirst.Hidden = isAtBegin;
            this.btnPageBackward.Hidden = isAtBegin;
            this.btnBackward.Hidden = isAtBegin;
            this.btnForward.Hidden = isAtEnd;
            this.btnPageForward.Hidden = isAtEnd;
            this.btnLast.Hidden = isAtEnd;
        } else {
            this.btnFirst.Disabled = isAtBegin;
            this.btnPageBackward.Disabled = isAtBegin;
            this.btnBackward.Disabled = isAtBegin;
            this.btnForward.Disabled = isAtEnd;
            this.btnPageForward.Disabled = isAtEnd;
            this.btnLast.Disabled = isAtEnd;
        }
    }
}

/**
 * Factory for Stepper components.
 */
export class StepperFactory<T> extends ComponentFactory<Stepper> {
    /**
     * Create, set up and return Stepper component.
     * @param steppable An object that imüplements `ISteppable`.
     * @param options Options for the stepper.
     * @param data Optional arbitrary data passed to the `setupComponent()` function of the factory.
     * @returns Stepper component.
     */
    public stepper(steppable: ISteppable, options?: StepperOptions, data?: T): Stepper {
        return this.setupComponent(new Stepper(steppable, options), data);
    }
}
