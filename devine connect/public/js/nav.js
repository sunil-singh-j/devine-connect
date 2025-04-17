
const hamburger=document.querySelector(".hamburger");
const navMenu=document.querySelector(".nav-menu")
const deskmenu=document.querySelectorAll(".deskmenu")








hamburger.addEventListener("click",()=>{
    hamburger.classList.toggle('active')
    navMenu.classList.toggle('active');

})

// deskmenu.forEach(n=>n.addEventListener('click',()=>{
//     navMenu.classList.remove('active')
// }))
var scroll=document.querySelector(".scrollTop");
window.addEventListener('scroll',()=>{
    
    console.log(scroll);
    scroll.classList.toggle('activescroll',window.scrollY >200)
})

scroll.addEventListener('click',()=>{
    scrolltop();
})
function scrolltop(){
    window.scrollTo({
        top:0,
        behavior:"smooth"
    })
}
