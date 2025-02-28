package com.timepaper.backend.domain.user.auth;

import com.timepaper.backend.domain.javaemail.JavaEmailDto;
import com.timepaper.backend.domain.javaemail.JavaEmailSender;
import com.timepaper.backend.domain.user.auth.dto.EmailverificationCheckRequestDto;
import com.timepaper.backend.domain.user.auth.dto.EmailverificationRequestDto;
import com.timepaper.backend.domain.user.auth.dto.SignupDto;
import com.timepaper.backend.domain.user.auth.entity.Auth;
import java.time.Duration;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

  private final AuthRepository authRepository;
  private final RedisTemplate<String, String> redisTemplate;
  private final JavaEmailSender javaEmailSender;

  public boolean emailverification(EmailverificationRequestDto dto) {
    boolean emailcheck = authRepository.findByEmail(dto.getEmail());

    if (emailcheck) {
      return false;
    } else {
      String randomCode = UUID.randomUUID().toString().replace("-", "").substring(0, 6)
          .toUpperCase();
      redisTemplate.opsForValue().set(dto.getEmail(), randomCode, Duration.ofMinutes(5));

      JavaEmailDto javaEmailDto = new JavaEmailDto(dto.getEmail(), "TimePaper", randomCode);

      javaEmailSender.sendJavaEmail(javaEmailDto);
      return true;
    }
  }

  @Transactional
  public boolean checkEmailVerificationCode(EmailverificationCheckRequestDto dto) {
    String randomCode = redisTemplate.opsForValue().get(dto.getEmail());
    return randomCode != null && randomCode.equals(dto.getCheckNum());
  }

  @Transactional
  public void signUp(SignupDto dto) {
    Auth auth = dto.toEntity(dto);
    authRepository.save(auth);
  }
}