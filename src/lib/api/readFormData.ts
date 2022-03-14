export const getString = (formData: FormData, key: string): string => {
	if (formData.has(key)) {
		return formData.get(key).toString();
	}
};
getString.array = (formData: FormData, key: string): string[] => {
	if (formData.has(key)) {
		return formData.getAll(key).map((e) => e.toString());
	}
};

export const getNumber = (formData: FormData, key: string): string => {
	if (formData.has(key)) {
		return formData.get(key).toString();
	}
};
getNumber.array = (formData: FormData, key: string): string[] => {
	if (formData.has(key)) {
		return formData.getAll(key).map((e) => e.toString());
	}
};

export const getBoolean = (formData: FormData, key: string): string => {
	if (formData.has(key)) {
		return formData.get(key).toString();
	}
};
getBoolean.array = (formData: FormData, key: string): string[] => {
	if (formData.has(key)) {
		return formData.getAll(key).map((e) => e.toString());
	}
};
