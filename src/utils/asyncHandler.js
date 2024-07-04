

const asyncHandler = (requestHandler) => {
    Promise.resolve(requestHandler(req, res, next))
    .catch((err) => next(err))
}

const asyncHandler1 = (fn) => async (req, res, next) => {

    try {
        await fn(req, res, next)
    } catch (error) {
        res.status(error.status || 500).json({
            status: false,
            message: error.message
        })
    }

}


export {asyncHandler1, asyncHandler}