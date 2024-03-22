// const apiRequest = async (url, method, data) => {
// 	  const response = await fetch(url, {
// 	method: method,
// 	headers: {
// 	  "Content-Type": "application/json",
// 	  Accept: "application/json",
// 	},
// 	body: JSON.stringify(data),
//   });
//   return response;
// }

const apiRequest = async (url = "", optionsObj = null, errMsg = null) => {
	try {
		const response = await fetch(url, optionsObj);
		if (!response.ok) {
			throw  Error("Please reload the app");
		}
		return response;
	} catch (err) {
		errMsg = err.message;
	} finally {
		return errMsg;
	}
};

export default apiRequest;
