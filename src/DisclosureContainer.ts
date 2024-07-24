import { ACustomComponentEvent, AElementComponentWithInternalUI, ComponentFactory, DEFAULT_CANCELABLE_EVENT_INIT_DICT, IElementWithChildrenComponent, INodeComponent } from "@vanilla-ts/core";
import { Button, Div, P, Span } from "@vanilla-ts/dom";


/**
 * Apperance of the disclosure container.
 */
export enum DisclosureContainerAppearance {
    // The header is at the top of the component, the button for disclose/undisclosing is on the
    // left side of the header
    TOP_LEFT = 0,
    TOP_RIGHT,
    RIGHT_TOP,
    RIGHT_BOTTOM,
    BOTTOM_RIGHT,
    BOTTOM_LEFT,
    LEFT_BOTTOM,
    LEFT_TOP,
}

/**
 * Captions and titles (tooltips) for the disclosure button.
 */
export type DisclosureContainerLabels = {
    /**
     * Captions. The first element is the caption for the state `Disclosed === false`, e.g.
     * 'Show details', the second elment is the caption for the state `Disclosed === true`, e.g.
     * 'Hide details'.
     */
    Captions: [string, string];
    /**
     * Titles (tooltips). The first element is the title for the state `Disclosed === false`, e.g.
     * 'Show details', the second elment is the title for the state `Disclosed === true`, e.g.
     * 'Hide details'.
     */
    Titles: [string, string];
};

/**
 * Custom 'disclose' event for disclosure containers.
 */
export class DiscloseEvent extends ACustomComponentEvent<"disclose", DisclosureContainer, {
    /** `true`, if the disclosure container is disclosed, otherwise `false`. */
    Disclosed: boolean;
}> {
    /**
     * Create DiscloseEvent event.
     * @param sender The event emitter (always `DisclosureContainer`).
     * @param disclosed `true`, if the DisclosureContainer was disclosed, otherwise `false`.
     * @param customEventInitDict Optional event properties.
     */
    constructor(sender: DisclosureContainer, disclosed: boolean, customEventInitDict: EventInit = DEFAULT_CANCELABLE_EVENT_INIT_DICT) {
        super("disclose", sender, { Disclosed: disclosed }, customEventInitDict); // eslint-disable-line jsdoc/require-jsdoc
    }
}

/**
 * Additional event(s) for `DisclosureContainer`.
 */
export interface DisclosureContainerEventMap extends HTMLElementEventMap {
    /** 
     * A disclosure container is disclosed/undisclosed. Event handlers can prevent changing the
     * `Disclosed` state by calling `preventDefault()`.
     */
    "disclose": DiscloseEvent;
}

/**
 * Container whose content can be disclosed/undisclosed.
 */
export class DisclosureContainer<EventMap extends DisclosureContainerEventMap = DisclosureContainerEventMap> extends AElementComponentWithInternalUI<Div, EventMap> {
    protected headerContainer: IElementWithChildrenComponent<HTMLDivElement>;
    protected discloseButton: Button;
    protected headerContent: IElementWithChildrenComponent<HTMLDivElement>;
    protected contentContainer: IElementWithChildrenComponent<HTMLDivElement>;
    protected _weakUndisclosed: boolean;
    protected _disclosed: boolean;
    protected _appearance: DisclosureContainerAppearance;
    protected _labels: DisclosureContainerLabels;

    /**
     * Creates DisclosureContainer component.
     * @param header The content for the header of the disclosure container (components or string,
     * in the case of a string, the header content is a `Span` component with the string as the
     * content).
     * @param content The content for the disclosure container (components or string, in the case
     * of a string, the container content is a `P` component with the string as the content).
     * @param labels The captions/titles for the disclosure button.
     * @param disclosed `true`, if the initial state of the disclosure container is 'disclosed',
     * otherwise `false`.
     * @param weakUndisclosed There are two ways of 'hiding'/'unhiding' the inner content container:
     * - by pure CSS, e.g. only the class names `disclosed`/`undisclosed` are set
     * - and (additionally to setting the mentioned class names) by removing/adding the inner
     *   content container from/to the internal DOM.
     * If `weak` is `true`, only the mentioned class names are set and the inner content container
     * will be left as is (mounted). If `weak` is `false`, the inner content container will be
     * removed/added from/to the internal DOM.
     * @param appearance The disclosure container appearance (header position and orientation).
     */
    constructor(
        header?: INodeComponent<Node>[] | string,
        content?: INodeComponent<Node>[] | string,
        labels: DisclosureContainerLabels = { Captions: ["+", "-"], Titles: ["", ""] }, // eslint-disable-line jsdoc/require-jsdoc
        disclosed: boolean = true,
        weakUndisclosed: boolean = false,
        appearance: DisclosureContainerAppearance = DisclosureContainerAppearance.TOP_LEFT
    ) {
        super();
        super.initialize()
            .labels(labels)
            .weakUndisclosed(weakUndisclosed)
            .disclosed(disclosed)
            .appearance(appearance);
        header !== undefined ? this.header(header) : undefined;
        content !== undefined ? this.content(content) : undefined;
    }

    /**
     * Get the disclose button component.
     */
    public get DiscloseButton(): Button {
        return this.discloseButton;
    }

    /**
     * Get the captions/titles for the disclosure button. Returns a _copy_ of the current
     * captions/titles!
     */
    public get Labels(): DisclosureContainerLabels {
        return { ...this._labels };
    }
    /** @inheritdoc */
    public set Labels(v: DisclosureContainerLabels) {
        this.labels(v);
    }

    /**
     * Set new captions/titles for the disclosure button. No reference to the given lables object
     * is held!
     * @param labels The new captions/titles.
     * @returns This instance.
     */
    public labels(labels: DisclosureContainerLabels): this {
        this._labels = {
            /* eslint-disable jsdoc/require-jsdoc */
            Captions: labels.Captions ?? ["+", "-"],
            Titles: labels.Titles ?? ["", ""]
            /* eslint-enable */
        };
        if (this._disclosed) {
            this.discloseButton.Text = this._labels.Captions[1];
            this.discloseButton.Title = this._labels.Titles[1];
        } else {
            this.discloseButton.Text = this._labels.Captions[0];
            this.discloseButton.Title = this._labels.Titles[0];
        }
        return this;
    }

    /**
     * Get the container component, that holds the header content (excluding the disclosure button).
     */
    public get Header(): IElementWithChildrenComponent<HTMLDivElement> {
        return this.headerContent;
    }

    /**
     * Set new content for the header (the disclosure button is retained). Setting new content for
     * the header _disposes the former content if `extractTo is `undefined`_!
     * @param header The new header content (components or string, in the case of a string, the
     * header content is a `Span` component with the string as the content).
     * @param extractTo An array, that, if given, will receive the former header component(s).
     * @returns This instance.
     */
    public header(header: INodeComponent<Node>[] | string, extractTo?: INodeComponent<Node>[]): this {
        return this.swapChildren(true, header, extractTo);
    }

    /**
     * Get the container component, that holds content of the disclosure container.
     */
    public get Content(): IElementWithChildrenComponent<HTMLDivElement> {
        return this.contentContainer;
    }

    /**
     * Set new content. Setting new content _disposes the former content if `extractTo is
     * `undefined`_!
     * @param content The new content (components or string, in the case of a string, the content is
     * a `P` component with the string as the content).
     * @param extractTo An array, that, if given, will receive the former content component(s).
     * @returns This instance.
     */
    public content(content: INodeComponent<Node>[] | string, extractTo?: INodeComponent<Node>[]): this {
        return this.swapChildren(false, content, extractTo);
    }

    /**
     * @see `header()` and `content()`.
     */
    /* eslint-disable-next-line jsdoc/require-jsdoc */
    protected swapChildren(ofHeader: boolean, content: INodeComponent<Node>[] | string, extractTo?: INodeComponent<Node>[]): this {
        const targetContainer = ofHeader ? this.headerContent : this.contentContainer;
        extractTo
            ? targetContainer.extract(extractTo)
            : targetContainer.clear();
        typeof content === "string"
            ? ofHeader
                ? targetContainer.append(new Span(content).addClass("header-text"))
                : targetContainer.append(new P(content))
            : targetContainer.append(...content);
        return this;
    }

    /**
     * Get/set the disclosed state.
     */
    public get Disclosed(): boolean {
        return this._disclosed;
    }
    /** @inheritdoc */
    public set Disclosed(v: boolean) {
        this.disclosed(v);
    }

    /**
     * Disclose/undisclose this component.
     * @param disclosed `true`, if the state of the disclosure container shall be 'disclosed',
     * otherwise `false`.
     * @returns This instance.
     */
    public disclosed(disclosed: boolean): this {
        if (disclosed !== this._disclosed) {
            if (!this.dispatch(new DiscloseEvent(this, disclosed))) { // eslint-disable-line jsdoc/require-jsdoc
                return this;
            }
            this._disclosed = disclosed;
            if (this._disclosed) {
                this.removeClass("undisclosed")
                    .addClass("disclosed");
                this.discloseButton.Text = this._labels.Captions[1];
                this.discloseButton.Title = this._labels.Titles[1];
                this._weakUndisclosed
                    ? undefined
                    : this.ui.append(this.contentContainer);
            } else {
                this.removeClass("disclosed")
                    .addClass("undisclosed");
                this.discloseButton.Text = this._labels.Captions[0];
                this.discloseButton.Title = this._labels.Titles[0];
                this._weakUndisclosed
                    ? undefined
                    : this.ui.remove(this.contentContainer);
            }
        }
        return this;
    }

    /**
     * Toggle the `Disclosed` state of this this component.
     * @returns This instance.
     */
    public toggleDisclosed(): this {
        this.disclosed(!this.Disclosed);
        return this;
    }

    /**
     * Get/set the 'weak undisclosed' property.
     * @see `weakUndisclosed()`.
     */
    public get WeakUndisclosed(): boolean {
        return this._weakUndisclosed;
    }
    /** @inheritdoc */
    public set WeakUndisclosed(v: boolean) {
        this.weakUndisclosed(v);
    }

    /**
     * Set the 'weak undisclosed' property.
     * @param weak There are two ways of 'hiding'/'unhiding' the inner content container:
     * - by pure CSS, e.g. only the class names `disclosed`/`undisclosed` are set
     * - and (additionally to setting the mentioned class names) by removing/adding the inner
     *   content container from/to the internal DOM.
     * If `weak` is `true`, only the mentioned class names are set and the inner content container
     * will be left as is (mounted). If `weak` is `false`, the inner content container will be
     * removed/added from/to the internal DOM.
     * @returns This instance.
     */
    public weakUndisclosed(weak: boolean): this {
        if (this._weakUndisclosed !== weak) {
            this._weakUndisclosed = weak;
            this._weakUndisclosed
                ? this.addClass("weak")
                : this.removeClass("weak");
            if (!this.Disclosed) {
                if (this._weakUndisclosed) {
                    this.ui.append(this.contentContainer);
                } else {
                    this.ui.remove(this.contentContainer);
                }
            }
        }
        return this;
    }

    /**
     * Get/set the appearance of the disclosure container.
     */
    public get Appearance(): DisclosureContainerAppearance {
        return this._appearance;
    }
    /** @inheritdoc */
    public set Appearance(v: DisclosureContainerAppearance) {
        this.appearance(v);
    }

    /**
     * Sets the appearance of the disclosure container.
     * @param appearance The new appearance. `BOTTOM_RIGHT`, for example, should set the header to
     * the bottom and the disclosure button to the right.
     * @returns This instance.
     */
    public appearance(appearance: DisclosureContainerAppearance): this {
        if (this._appearance !== appearance) {
            this._appearance = appearance;
            let clazz: string;
            switch (this._appearance) {
                case DisclosureContainerAppearance.TOP_LEFT:
                    clazz = "top-left";
                    break;
                case DisclosureContainerAppearance.TOP_RIGHT:
                    clazz = "top-right";
                    break;
                case DisclosureContainerAppearance.RIGHT_TOP:
                    clazz = "right-top";
                    break;
                case DisclosureContainerAppearance.RIGHT_BOTTOM:
                    clazz = "right-bottom";
                    break;
                case DisclosureContainerAppearance.BOTTOM_LEFT:
                    clazz = "bottom-left";
                    break;
                case DisclosureContainerAppearance.BOTTOM_RIGHT:
                    clazz = "bottom-right";
                    break;
                case DisclosureContainerAppearance.LEFT_TOP:
                    clazz = "left-top";
                    break;
                case DisclosureContainerAppearance.LEFT_BOTTOM:
                    clazz = "left-bottom";
                    break;
                default:
                    clazz = "top-left";
                    break;
            }
            this.ui
                .removeClass("top-left", "top-right", "right-top", "right-bottom", "bottom-left", "bottom-right", "left-top", "left-bottom")
                .addClass(clazz);
        }
        return this;
    }

    /**
     * Build UI of the component.
     * @returns This instance.
     */
    protected buildUI(): this {
        this.ui = new Div()
            .append(
                this.headerContainer = new Div()
                    .addClass("header-container")
                    .append(
                        this.discloseButton = new Button("")
                            .addClass("disclose")
                            .on("click", () => this.Disclosed = !this.Disclosed),
                        this.headerContent = new Div()
                            .addClass("header-content")
                        // .on("pointerup", (_ev: PointerEvent) => this.Disclosed = !this.Disclosed),
                    ),
                this.contentContainer = new Div()
                    .addClass("content-container"),
            );
        return this;
    }

    /** @inheritdoc */
    public override clear(): this {
        // `clear()` wouldn't reach the content container if `_weakUndisclosed` is `false` and
        // `DisclosureContainer` is undisclosed because the content container isn't mounted then!
        !this._weakUndisclosed && !this._disclosed
            ? this.contentContainer.clear()
            : undefined;
        super.clear(); // !!
        return this;
    }
}

/**
 * Factory for DisclosureContainer components.
 */
export class DisclosureContainerFactory<T> extends ComponentFactory<DisclosureContainer> {
    /**
     * Create, set up and return DisclosureContainer component.
     * @param header The content for the header of the disclosure container (components or string,
     * in the case of a string, the header content is a `Span` component with the string as the
     * content).
     * @param content The content for the disclosure container (components or string, in the case
     * of a string, the container content is a `Span` component with the string as the content).
     * @param labels The captions/titles for the disclosure button.
     * @param disclosed `true`, if the initial state of the disclosure container is 'disclosed',
     * otherwise `false`.
     * @param weakUndisclosed There are two ways of 'hiding'/'unhiding' the inner content container:
     * - by pure CSS, e.g. only the class names `disclosed`/`undisclosed` are set
     * - and (additionally to setting the mentioned class names) by removing/adding the inner
     *   content container from/to the internal DOM.
     * If `weak` is `true`, only the mentioned class names are set and the inner content container
     * will be left as is (mounted). If `weak` is `false`, the inner content container will be
     * removed/added from/to the internal DOM.
     * @param appearance The disclosure container appearance (header position and orientation).
     * @param data Optional arbitrary data passed to the `setupComponent()` function of the factory.
     * @returns DisclosureContainer component.
     */
    public disclosureContainer(
        header?: INodeComponent<Node>[] | string,
        content?: INodeComponent<Node>[] | string,
        labels: DisclosureContainerLabels = { Captions: ["+", "-"], Titles: ["", ""] }, // eslint-disable-line jsdoc/require-jsdoc
        disclosed: boolean = true,
        weakUndisclosed: boolean = false,
        appearance: DisclosureContainerAppearance = DisclosureContainerAppearance.TOP_LEFT,
        data?: T
    ): DisclosureContainer {
        return this.setupComponent(new DisclosureContainer(header, content, labels, disclosed, weakUndisclosed, appearance), data);
    }
}
