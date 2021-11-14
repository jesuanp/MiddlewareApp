import {
	LOGIN_OKEY,
	LOGOUT_OKEY,
	GET_JUNIORS,
	GET_JUNIORS_DETAILS,
	GET_COMPANIES,
	GET_LANGUAGES,
	GET_TECHNOLOGIES,
	GET_COMPANY_DETAILS,
	GET_PUBLICATIONS,
	GET_PUBLICATIONS_BY_ID,
	SORT_JOBS_BY,
	FILTER_JOBS_BY_COUNTRIES,
	FILTER_JOBS_BY_CITIES,
	FILTER_JOBS_BY_SALARIES,
	FILTER_JOBS_BY_TECHS,
	SEARCH_JOBS_BY_TITLE,
	RESET_JOBS_FILTER,
	CHANGE_PROFILE_PICTURE,
	EMAIL_VERIFICATION,
	ERROR_LOGIN,
	GET_JOB_DETAILS,
	GET_JOBS,
	POSTULATION,
	ADD_NEW_JOB,
	GET_UBICATION,
} from '../types';
import clienteAxios from '../../components/config/clienteAxios';
import { auth, firebase, actionCodeSettings } from '../../firebaseConfig';
import {
	signInWithPopup,
	linkWithPopup,
	GoogleAuthProvider,
	GithubAuthProvider,
	signInWithEmailAndPassword,
	sendEmailVerification,
	createUserWithEmailAndPassword,
	signOut,
	deleteUser,
	getAuth,
} from 'firebase/auth';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import tokenAuth from '../../components/config/token';
/*LOGIN*/
const googleProvider = new GoogleAuthProvider();
const githubProvider = new GithubAuthProvider();
const storage = getStorage(firebase);
const loginHelper = async (userFirebase, dispatch, userType) => {
	const { uid, email, displayName, photoURL } = userFirebase.user;
	const user = {
		name: displayName || 'Sin Nombre',
		idUser: uid,
		gmail: email,
		photograph: photoURL || false,
		userType,
	};
	try {
		const rta = await clienteAxios.post('/login', user);
		console.log(rta.data.auth);
		if (!rta.data.auth) {
			await signOut(auth);
			console.log('deslogueado');
			dispatch(errorLoginAction(rta.data.msg));
			return;
		}
		dispatch(loginOkey(rta.data.user));

		localStorage.setItem('token', rta.data.token);
		localStorage.setItem('userType', userType);
		tokenAuth(rta.data.token); //firmar el token a header
	} catch (error) {
		console.log(error);
	}
};
export const loginUserAction = (provider, userType) => {
	return async (dispatch) => {
		try {
			if (provider === 'google')
				var userFirebase = await signInWithPopup(auth, googleProvider);
			if (provider === 'github')
				var userFirebase = await signInWithPopup(auth, githubProvider);
			loginHelper(userFirebase, dispatch, userType);
		} catch (e) {
			console.log(e);
			if (
				e.message ===
				'Firebase: Error (auth/account-exists-with-different-credential).'
			) {
				var userFirebase = await signInWithPopup(auth, googleProvider);
				loginHelper(userFirebase, dispatch, userType);
			}
		}
	};
};
export const loginUserEmailPassAction = (email, pass, name) => {
	return async (dispatch) => {
		const userType = localStorage.getItem('userType');
		const gmail = email;

		if (name) {
			try {
				//   console.log("entro aca!");
				const userFirebase = await createUserWithEmailAndPassword(
					auth,
					gmail,
					pass
				);
				await sendEmailVerification(userFirebase.user, actionCodeSettings);
				//envio mail de verificacion
				const { uid, email } = userFirebase.user;
				const user = {
					name,
					idUser: uid,
					gmail: email,
					userType,
					emailAndPass: false,
				};
				//creo al usuario en la db
				console.log(user, 'esto mando al post');
				const rta = await clienteAxios.post('/login', user);
				console.log(rta.data);
				dispatch(emailVerificationAction(false));
				await signOut(auth);
				console.log('deslogueado');
			} catch (error) {
				console.log(error, 'create error');
			}
		} else {
			// si hay user
			try {
				//   console.log(" aca!");
				const userFirebase = await signInWithEmailAndPassword(
					auth,
					email,
					pass
				);
				loginHelper(userFirebase, dispatch, userType);
			} catch (error) {
				console.log(error.code, 'asdasd');
				if (error.code === 'auth/wrong-password') {
					dispatch(errorLoginAction('Usuario o Contraseña incorrecta'));
				} else if (error.code === 'auth/too-many-requests') {
					dispatch(errorLoginAction('Usuario bloqueado, Resetea la clave'));
				} else if (error.code === 'auth/user-not-found') {
					dispatch(errorLoginAction('Usuario No Registrado'));
				}
			}
		}
	};
};
export const errorLoginAction = (msg) => ({
	type: ERROR_LOGIN,
	payload: msg,
});
export const emailVerificationAction = (boolean) => ({
	type: EMAIL_VERIFICATION,
	payload: boolean,
});

export const getUserAction = (userProvider) => {
	return async (dispatch) => {
		try {
			const userType = localStorage.getItem('userType');
			const token = localStorage.getItem('token');
			if (!userProvider) console.log(auth.currentUser, 'auth');
			if (userType && token) {
				clienteAxios
					.get(`/${userType}/${userProvider.uid}?firebase=true`)
					.then((rta) => {
						// console.log(rta.data, "dato de cuando obtengo ");
						dispatch(loginOkey(rta.data));
					});
			}
		} catch (e) {
			console.log(e, 'algo ');
		}
	};
};

const loginOkey = (user) => ({
	type: LOGIN_OKEY,
	payload: user,
});

export const logOutUserAction = () => {
	return async (dispatch) => {
		try {
			await signOut(auth);
			localStorage.removeItem('token');
			localStorage.removeItem('userType');
			dispatch(logOutOkey());
		} catch (e) {
			console.log(e);
		}
	};
};

const logOutOkey = () => ({
	type: LOGOUT_OKEY,
});

/*LENGUAGES*/
export function getLanguages(payload) {
	return async function (dispatch) {
		try {
			const json = await clienteAxios.get('/languages');
			return dispatch({ type: GET_LANGUAGES, payload: json.data });
		} catch (error) {}
	};
}

/*TECNOLOGIES*/
export function getTechnologies(payload) {
	return async function (dispatch) {
		try {
			const json = await clienteAxios.get('/technologies');
			return dispatch({ type: GET_TECHNOLOGIES, payload: json.data });
		} catch (error) {}
	};
}

/*JUNIORS*/
export function getJuniors(payload) {
	return async function (dispatch) {
		try {
			const json = await clienteAxios.get('/juniors');
			return dispatch({ type: GET_JUNIORS, payload: json.data });
		} catch (e) {
			console.log(e);
		}
	};
}

export const getJuniorsDetails = (id) => {
	return async function (dispatch) {
		try {
			var json = await clienteAxios.get('/juniors/' + id);
			return dispatch({
				type: GET_JUNIORS_DETAILS,
				payload: json.data,
			});
		} catch (e) {
			console.log(e);
		}
	};
};
export function putJuniors(data, id) {
	return async function () {
		try {
			const response = await clienteAxios.put(`/juniors/${id}`, data);
			// llamar al dispatch
			console.log(response.data, 'editar usuario ok');
		} catch (e) {
			console.log(e, 'e');
		}
	};
}

export function deleteJuniors(id) {
	return async function (dispatch) {
		const auth = getAuth();
		const user = auth.currentUser;
		const response = await clienteAxios.delete(`/juniors/${id}`);
		if (response.data.deleted) {
			dispatch(logOutUserAction());
			await deleteUser(user);
		}
	};
}

/*COMPANIES*/
export function getCompanies(payload) {
	return async function (dispatch) {
		try {
			const json = await clienteAxios.get('/companies');
			return dispatch({ type: GET_COMPANIES, payload: json.data });
		} catch (error) {}
	};
}

export const getCompanyDetails = (id) => {
	return async function (dispatch) {
		try {
			var json = await clienteAxios.get('/companies/' + id);
			return dispatch({
				type: GET_COMPANY_DETAILS,
				payload: json.data,
			});
		} catch (e) {
			console.log(e);
		}
	};
};

/*PUBLICATIONS*/
export function getPublications() {
	return async function (dispatch) {
		try {
			const json = await clienteAxios.get('/publications');
			return dispatch({ type: GET_PUBLICATIONS, payload: json.data });
		} catch (error) {}
	};
}

export function getPublicationsById(id) {
	return async function (dispatch) {
		try {
			const json = await clienteAxios.get(`/publications/${id}`);
			return dispatch({ type: GET_PUBLICATIONS_BY_ID, payload: json.data });
		} catch (error) {}
	};
}

export function postPublications(payload, nameUser, idUser) {
	return async function (dispatch) {
		const response = await clienteAxios.post(
			`/publications?nameUser=${nameUser}&idUser=${idUser}`,
			payload
		);
		return dispatch({ type: 'POST_PUBLICATION', payload: response.data });
	};
}

export function putPublications(idPublication, idUser, data) {
	return async function (dispatch) {
		const response = await clienteAxios.put(
			`/publications?idPublication=${idPublication}&idUser=${idUser}`,
			data
		);
		return dispatch({ type: 'PUT_PUBLICATION', payload: response.data });
	};
}

export function putLike(idPublication, idUser) {
	return async function () {
		const response = await clienteAxios.put(
			`/addLike?idPublication=${idPublication}&idUser=${idUser}`
		);
		return response;
	};
}

export function deletePublications(idPublication, idUser, userType) {
	return async function (dispatch) {
		const response = await clienteAxios.delete(
			`/publications?idPublication=${idPublication}&idUser=${idUser}&userType=${userType}`
		);
		return dispatch({ type: 'DELETE_PUBLICATION', payload: response.data });
	};
}

/*JOBS*/
export function postJobs(payload) {
	return async function (dispatch) {
		const response = await clienteAxios.post('/jobs', payload);
		return dispatch({
			type: ADD_NEW_JOB,
			payload: response.data,
		});
	};
}

export function sortJobsBy(payload) {
	return async function (dispatch) {
		dispatch({
			type: SORT_JOBS_BY,
			payload,
		});
	};
}

export function filterJobsByCountries(payload) {
	return async function (dispatch) {
		dispatch({
			type: FILTER_JOBS_BY_COUNTRIES,
			payload,
		});
	};
}

export function filterJobsByCities(payload) {
	return async function (dispatch) {
		dispatch({
			type: FILTER_JOBS_BY_CITIES,
			payload,
		});
	};
}

export function filterJobsBySalaries(payload) {
	return async function (dispatch) {
		dispatch({
			type: FILTER_JOBS_BY_SALARIES,
			payload,
		});
	};
}

export function filterJobsByTechs(payload) {
	return async function (dispatch) {
		dispatch({
			type: FILTER_JOBS_BY_TECHS,
			payload,
		});
	};
}

export function searchJobsByTitle(payload) {
	return async function (dispatch) {
		dispatch({
			type: SEARCH_JOBS_BY_TITLE,
			payload,
		});
	};
}

export function resetFilterJobs(payload) {
	return async function (dispatch) {
		dispatch({
			type: RESET_JOBS_FILTER,
			payload,
		});
	};
}

export const changePictureProfileAction = (picture) => {
	return async function (dispatch) {
		try {
			const fileRef = ref(storage, `documents/${picture.name}`);
			await uploadBytes(fileRef, picture);
			const urlPicture = await getDownloadURL(fileRef);
			dispatch(urlProfilePic(urlPicture));
		} catch (error) {
			console.log(error);
		}
	};
};
const urlProfilePic = (urlPicture) => ({
	type: CHANGE_PROFILE_PICTURE,
	payload: urlPicture,
});

export const changePicturePublicationAction = (picture) => {
	return async function (dispatch) {
		try {
			const fileRef = ref(storage, `documents/${picture.name}`);
			await uploadBytes(fileRef, picture);
			const urlPicture = await getDownloadURL(fileRef);
			dispatch(urlUploadPic(urlPicture));
		} catch (error) {
			console.log(error);
		}
	};
};
const urlUploadPic = (urlPicture) => ({
	type: 'UPLOAD_PICTURE',
	payload: urlPicture,
});

export const changePicturePublications = (picture) => {
	return async function (dispatch) {
		try {
			const fileRef = ref(storage, `documents/${picture.name}`);
			await uploadBytes(fileRef, picture);
			const urlPicturePublication = await getDownloadURL(fileRef);
			dispatch(urlUploadPicPublication(urlPicturePublication));
		} catch (error) {
			console.log(error);
		}
	};
};
const urlUploadPicPublication = (urlPicturePublication) => ({
	type: 'UPLOAD_PICTURE_PUBLICATION',
	payload: urlPicturePublication,
});

export const resetPicturePublications = () => {
	return async function (dispatch) {
		return dispatch({
			type: 'RESET_PICTURE_PUBLICATION',
			payload: null,
		});
	};
};

export function getJobDetails(id) {
	return async function (dispatch) {
		try {
			const job = await clienteAxios.get(`/jobs/${id}`);
			return dispatch({ type: GET_JOB_DETAILS, payload: job.data });
		} catch (error) {}
	};
}

export function getJobs() {
	return async function (dispatch) {
		try {
			const allJobs = await clienteAxios.get(`/jobs`);
			return dispatch({ type: GET_JOBS, payload: allJobs.data });
		} catch (error) {}
	};
}

export function postulation(idJob, idUser, coverLetter) {
	return async function (dispatch) {
		try {
			const allJobs = await clienteAxios.put(
				`/jobs/postulation/${(juniorId, coverLetter)}`,
				{
					juniorId,
					coverLetter,
				}
			);
			/* 			return dispatch({ type: GET_JOBS, payload: allJobs.data }); */
		} catch (error) {}
	};
}

export const getCountryStateAction = () => {
	return async function (dispatch) {
		try {
			const allUbication = await clienteAxios.get(`/ubication`);
			console.log(allUbication.data, 'fromaction');
			return dispatch({ type: GET_UBICATION, payload: allUbication.data });
		} catch (error) {}
	};
};

export function editJobPostulationsAction(idJob, job) {
	return async function (dispatch) {
		try {
			await clienteAxios.put(`/jobs/${idJob}`, job);
			console.log('se mando el job editado');
		} catch (error) {
			console.log(error);
		}
	};
}
export const editCompanyDataAction = (infoUser) => {
	return async function (dispatch) {
		try {
			const editCompany = await clienteAxios.put(
				`/companies/${infoUser.idFireBase}`,
				infoUser
			);
			// return dispatch({ type: GET_JOBS, payload: editCompany.data });
			console.log(editCompany.data);
		} catch (error) {
			console.log(error);
		}
	};
};
