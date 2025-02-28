package com.timepaper.backend.domain.user.auth;

import com.timepaper.backend.domain.user.auth.dto.EmailverificationCheckRequestDto;
import com.timepaper.backend.domain.user.auth.dto.EmailverificationRequestDto;
import com.timepaper.backend.domain.user.auth.dto.SignupDto;
import com.timepaper.backend.global.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/auth")
public class AuthController {

  private final AuthService authService;

  @PostMapping("/email-verification-codes")
  public ResponseEntity<ApiResponse<Boolean>> emailverification(
      @RequestBody EmailverificationRequestDto dto) {
    return ResponseEntity.ok(ApiResponse.ok(
        authService.emailverification(dto)
    ));
  }


  @PostMapping("/auth/email-verification-codes/validate")
  public ResponseEntity<Boolean> checkEmailVerificationCode(
      @RequestBody EmailverificationCheckRequestDto dto) {
    boolean result = authService.checkEmailVerificationCode(dto);
    return ResponseEntity.ok(result);
  }

  @PostMapping("/signup")
  public void signUp(@RequestBody SignupDto dto) {
    authService.signUp(dto);
  }
}
