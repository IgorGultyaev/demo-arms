interface JQueryStatic {
	mockjax(settings: MockjaxSettings): number;
	mockjaxClear(mock?: number): void;

	mockjaxSettings: MockjaxSettings;
}

interface MockjaxSettings {
	url?:          string|RegExp;
	type?:         string;
	dataType?:     string;
	status?:       number;
	statusText?:   string;
	responseTime?: number;
	isTimeout?:    boolean;
	contentType?:  string;
	response?:     Function|string;
	responseText?: Object|string;
	headers?:      { [key: string]: string };
}

