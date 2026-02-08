function showpwd() {
        const pwd = document.getElementById('password');
        const eyeIcon = document.getElementById('togglePassword');
        if(pwd.type==='password') {
            pwd.type='text';
            eyeIcon.classList.remove('fa-eye');
            eyeIcon.classList.add('fa-eye-slash');
        } 
        else{
            pwd.type='password';
            eyeIcon.classList.remove('fa-eye-slash');
            eyeIcon.classList.add('fa-eye');
        }
}