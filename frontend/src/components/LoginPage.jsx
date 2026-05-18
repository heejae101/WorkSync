import React from "react";
import RotatingText from "../motion/RotatingText";
import "./LoginPage.css";

function LoginPage() {
  return (
    <div className="login-page">
      <div className="login-content">
        <div className="login-title">
          <span className="fixed-text">It’s time to</span>

          <span className="rotate-box">
            <RotatingText
              texts={["Start", "Build", "Create", "Grow"]}
              splitBy="characters"
              mainClassName="rotate-inner"
              splitLevelClassName="rotate-word"
              elementLevelClassName="rotate-letter"
              staggerDuration={0.06}
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "-120%", opacity: 0 }}
              transition={{
                type: "spring",
                damping: 30,
                stiffness: 400,
              }}
              rotationInterval={3000}
            />
          </span>
        </div>

        <form className="login-form">
          <input type="text" placeholder="아이디를 입력해주세요" />
          <input type="password" placeholder="비밀번호를 입력해주세요" />

          <button type="submit">로그인</button>

          <a href="/signup">회원가입</a>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;