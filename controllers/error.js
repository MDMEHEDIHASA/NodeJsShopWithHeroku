exports.getError = (req,res,next)=>{
    res.status(404).render('404',{
        pageTitle: '404 Error Page',
        path:'/404',
        isAuthinticate:req.session.isLoggedIn
    });
}


exports.get500 = (req,res,next)=>{
    res.status(500).render('500',{
        pageTitle:'500 Error page',
        path:'/500',
        isAuthinticate:req.session.isLoggedIn,
    })
}