const deleteProduct = (btn)=>{
    const parentElement = btn.parentElement;
    const articleSelect = btn.closest('article');
    const prChildren = parentElement.children;
    const csrf = prChildren[1].value;
    const productId = prChildren[2].value;
    console.log(`csrf:${csrf} productId:${productId}`);
    fetch('/admin/product/'+productId,{
        method:"DELETE",
        headers:{
            "csrf-token":csrf
        }
    }).then(result=>{
        return result.json();
    }).then(data=>{
        console.log(data);
        articleSelect.remove();
    }).catch(err=>{
        console.log(err);
    })
}