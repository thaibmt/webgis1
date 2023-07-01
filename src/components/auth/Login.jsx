import { useRef, useState } from 'react'
import '../../assets/auth/vendor/bootstrap/css/bootstrap.min.css'
import '../../assets/auth/fonts/font-awesome-4.7.0/css/font-awesome.min.css'
import '../../assets/auth/fonts/iconic/css/material-design-iconic-font.min.css'
import '../../assets/auth/vendor/animate/animate.css'
import '../../assets/auth/vendor/css-hamburgers/hamburgers.min.css'
import '../../assets/auth/vendor/animsition/css/animsition.min.css'
import '../../assets/auth/vendor/select2/select2.min.css'
import '../../assets/auth/vendor/daterangepicker/daterangepicker.css'
import '../../assets/auth/vendor/daterangepicker/daterangepicker.css'
import '../../assets/auth/css/util.css'
import '../../assets/auth/css/main.css'
function Login() {
    const [name, setName] = useState('')
    const [password, setPassword] = useState('')
    const nameRef = useRef();
    const passwordRef = useRef();

    const handleInputBlur = (e) => {
        if (e.target.value.trim()) {
            e.target.addClass('has-val')
        } else {
            e.target.removeClass('has-val')
        }
    }

    const handleInputFocus = (e) => {
        hideValidate(e.target);
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        let check = true;
        [nameRef.current, passwordRef.current].map(input => {
            if (validate(input) == false) {
                showValidate(input);
                check = false;
            }
        })

        return check;
    }

    function validate(input) {
        if (input.getAttribute('type') == 'email' || input.getAttribute('type') == 'email') {
            if (input.value.trim().match(/^([a-zA-Z0-9_\-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([a-zA-Z0-9\-]+\.)+))([a-zA-Z]{1,5}|[0-9]{1,3})(\]?)document.querySelector/) == null) {
                return false;
            }
        }
        else {
            if (input.value.trim() == '') {
                return false;
            }
        }
    }

    function showValidate(input) {
        input.closest('div').classList.add('alert-validate');
    }

    function hideValidate(input) {
        input.closest('div').classList.remove('alert-validate');
    }

    return (
        <>
            <div className="limiter">
                <div className="container">
                    <div className="img-title"></div>
                    <div className="container-login100">
                        <div className="wrap-login100 p-l-55 p-r-55 p-t-40 p-b-40">
                            <form className="login100-form validate-form" onSubmit={handleSubmit}>
                                <span className="login100-form-title p-b-30">
                                    Login
                                </span>

                                <div className="wrap-input100 validate-input m-b-23" data-validate="Tên đăng nhập là bắt buộc">
                                    <span className="label-input100">Tên đăng nhập</span>
                                    <input className="input100" type="text" name="name" placeholder="Tên đăng nhập" ref={nameRef} value={name} onChange={(e) => { setName(e.target.value) }} onBlur={handleInputBlur} onFocus={handleInputFocus} />
                                    <span className="focus-input100" data-symbol="&#xf206;"></span>
                                </div>

                                <div className="wrap-input100 validate-input" data-validate="Mật khẩu là bắt buộc">
                                    <span className="label-input100">Mật khẩu</span>
                                    <input className="input100" type="password" name="pass" placeholder="Mật khẩu" ref={passwordRef} value={password} onChange={(e) => { setPassword(e.target.value) }} onBlur={handleInputBlur} onFocus={handleInputFocus} />
                                    <span className="focus-input100" data-symbol="&#xf190;"></span>
                                </div>

                                <div className="text-right p-t-8 p-b-31">
                                    <a href="#">
                                        Quên mật khẩu?
                                    </a>
                                </div>

                                <div className="container-login100-form-btn">
                                    <div className="wrap-login100-form-btn">
                                        <div className="login100-form-bgbtn"></div>
                                        <button className="login100-form-btn">
                                            Login
                                        </button>
                                    </div>
                                </div>

                                <div className="txt1 text-center p-t-40 p-b-20">
                                    <span>
                                        Or Sign Up Using
                                    </span>
                                </div>

                                <div className="flex-c-m">
                                    <a href="#" className="login100-social-item bg1">
                                        <i className="fa fa-facebook"></i>
                                    </a>

                                    <a href="#" className="login100-social-item bg2">
                                        <i className="fa fa-twitter"></i>
                                    </a>

                                    <a href="#" className="login100-social-item bg3">
                                        <i className="fa fa-google"></i>
                                    </a>
                                </div>

                                <div className="flex-col-c p-t-54">
                                    <span className="txt1 p-b-17">
                                        Or Sign Up Using
                                    </span>

                                    <a href="#" className="txt2">
                                        Sign Up
                                    </a>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>


            <div id="dropDownSelect1"></div>
        </>
    )
}
export default Login