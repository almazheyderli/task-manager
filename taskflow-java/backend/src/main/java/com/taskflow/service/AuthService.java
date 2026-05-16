package com.taskflow.service;

import com.taskflow.dto.Dto;
import com.taskflow.model.User;
import com.taskflow.repository.UserRepository;
import com.taskflow.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public Dto.AuthResponse register(Dto.RegisterRequest req) {
        if (userRepository.existsByEmail(req.getEmail())) {
            throw new IllegalArgumentException("Bu email artıq istifadə olunur");
        }

        User user = new User();
        user.setName(req.getName().trim());
        user.setEmail(req.getEmail().toLowerCase().trim());
        user.setPassword(passwordEncoder.encode(req.getPassword()));

        user = userRepository.save(user);

        String token = jwtService.generateToken(user.getId(), user.getEmail());
        return new Dto.AuthResponse(token, toUserDto(user));
    }

    public Dto.AuthResponse login(Dto.LoginRequest req) {
        User user = userRepository.findByEmail(req.getEmail().toLowerCase())
                .orElseThrow(() -> new IllegalArgumentException("Email və ya şifrə yanlışdır"));

        if (!passwordEncoder.matches(req.getPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Email və ya şifrə yanlışdır");
        }

        String token = jwtService.generateToken(user.getId(), user.getEmail());
        return new Dto.AuthResponse(token, toUserDto(user));
    }

    private Dto.UserDto toUserDto(User u) {
        return new Dto.UserDto(u.getId(), u.getName(), u.getEmail());
    }
}
