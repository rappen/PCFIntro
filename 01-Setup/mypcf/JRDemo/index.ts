import { IInputs, IOutputs } from "./generated/ManifestTypes";
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Demo } from './tsx/demo';

export class JRDemo implements ComponentFramework.StandardControl<IInputs, IOutputs> {

	private _wrapper: HTMLDivElement;
	private _element: HTMLSpanElement;
	private _min: number = 10;
	private _max: number = 100;
	private _input: HTMLInputElement;
	private _value: number | undefined;
	private _notifyOutputChanged: () => void;
	private _inputOnChange: EventListenerOrEventListenerObject;
	private _emptyValue = "---";
	private _reactwrapper: HTMLDivElement;

	/**
	 * Empty constructor.
	 */
	constructor() {

	}

	/**
	 * Used to initialize the control instance. Controls can kick off remote server calls and other initialization actions here.
	 * Data-set values are not initialized here, use updateView.
	 * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to property names defined in the manifest, as well as utility functions.
	 * @param notifyOutputChanged A callback method to alert the framework that the control has new outputs ready to be retrieved asynchronously.
	 * @param state A piece of data that persists in one session for a single user. Can be set at any point in a controls life cycle by calling 'setControlState' in the Mode interface.
	 * @param container If a control is marked control-type='standard', it will receive an empty div element within which it can render its content.
	 */
	public init(context: ComponentFramework.Context<IInputs>, notifyOutputChanged: () => void, state: ComponentFramework.Dictionary, container: HTMLDivElement) {
		this._wrapper = document.createElement("div");
		this._element = document.createElement("span");
		this._wrapper.appendChild(this._element);

		this._reactwrapper = document.createElement("div");

		let icon = document.createElement("div");
		icon.classList.add("icon");
		this._wrapper.appendChild(icon);

		container.appendChild(this._wrapper);
		container.appendChild(this._reactwrapper);
		let value = context.parameters.input.raw ? context.parameters.input.raw : 0;

		this._min = context.parameters.min.raw ? context.parameters.min.raw : 10;
		this._max = context.parameters.max.raw ? context.parameters.max.raw : 100;

		this._input = document.createElement("input");
		this._input.setAttribute("id", "inputField");
		this._input.setAttribute("type", "text");
		this._wrapper.appendChild(this._input);

		this._notifyOutputChanged = notifyOutputChanged;
		this._inputOnChange = this.inputOnChange.bind(this);
		this._input.addEventListener("change", this._inputOnChange);

		this.setFormat(value, context.parameters.input.raw ?? undefined);
	}

	private setFormat(value: number, input: number | undefined): void {
		this._element.innerHTML = value.toString();
		if (value >= this._min && value <= this._max) {
			this._wrapper.classList.remove("invalid");
		} else {
			this._wrapper.classList.add("invalid");
		}
		if (input === undefined || input === NaN) {
			this._input.value = this._emptyValue;
		}
		else {
			this._input.value = input?.toString();
		}
		this._value = input;
	}

	public inputOnChange(): void {
		if (this._input.value === this._emptyValue) {
			this._value = 0;
		}
		else {
			this._value = parseInt(this._input.value);
		}
		this._notifyOutputChanged();
	}

	/**
	 * Called when any value in the property bag has changed. This includes field values, data-sets, global values such as container height and width, offline status, control metadata values such as label, visible, etc.
	 * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to names defined in the manifest, as well as utility functions
	 */
	public updateView(context: ComponentFramework.Context<IInputs>): void {
		this._min = context.parameters.min.raw ? context.parameters.min.raw : 10;
		this._max = context.parameters.max.raw ? context.parameters.max.raw : 100;
		let value = context.parameters.input.raw ? context.parameters.input.raw : 0;
		this.setFormat(value, context.parameters.input.raw ?? undefined);
		ReactDOM.render(
			React.createElement(
				Demo,
				{ value: this._value }
			),
			this._reactwrapper
		);
	}

	/** 
	 * It is called by the framework prior to a control receiving new data. 
	 * @returns an object based on nomenclature defined in manifest, expecting object[s] for property marked as “bound” or “output”
	 */
	public getOutputs(): IOutputs {
		return { input: this._value };
	}

	/** 
	 * Called when the control is to be removed from the DOM tree. Controls should use this call for cleanup.
	 * i.e. cancelling any pending remote calls, removing listeners, etc.
	 */
	public destroy(): void {
		this._input.removeEventListener("change", this._inputOnChange);
	}
}