exports.get403 = (req,res) =>{
    res.render('shop/403',{
        pageTitle:'Unauthorized',
        path: '/403',
        isAuthenticated:req.session.isLoggedIn
    })
}

exports.get404 = (req,res) =>{
    res.render('shop/404',{
        pageTitle:'Page Not Found',
        path: '/404',
        isAuthenticated:req.session.isLoggedIn
    })
}

exports.get500 = (req,res) =>{
    res.render('shop/500',{
        pageTitle:'Error!',
        path: '/500',
        isAuthenticated:req.session.isLoggedIn
    })
}

