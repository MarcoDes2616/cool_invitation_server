const {storage} = require('../utils/firebase');
const { ref, uploadBytes, getDownloadURL } = require('firebase/storage');

const firebaseFile = async(req, res, next) => {
    if(!req.file){     
        next()
        return
    }
    try {
        const imgRef = ref(storage, `post/${Date.now()}-${req.file.originalname}`);
        const imgUploaded = await uploadBytes(imgRef, req.file.buffer);
        req.body.image_reference =  imgUploaded.metadata.fullPath
        next()
    } catch (error) {
        next(error)
    }
}

const getFirebaseUrl = async(path) => {
    try {
        const newRef = ref(storage, path)
        const url = await getDownloadURL(newRef)
        return url
    } catch (error) {
        return error
    }
}

module.exports = {firebaseFile, getFirebaseUrl}