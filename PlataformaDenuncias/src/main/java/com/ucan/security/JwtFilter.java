
package com.ucan.security;

/**
 *
 * @author cristiano


import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtFilter extends OncePerRequestFilter {
  @Override
  protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
    throws ServletException, IOException {

    // Aqui você pode pegar o token JWT do header e validar
    String token = request.getHeader("Authorization");
    // Suponha que o token seja válido, você pode autenticar assim (exemplo simples):
    if (token != null && token.startsWith("Bearer ")) {
      UsernamePasswordAuthenticationToken authToken =
          new UsernamePasswordAuthenticationToken("user", null, null);
      authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
      SecurityContextHolder.getContext().setAuthentication(authToken);
    }

    filterChain.doFilter(request, response);
  }
}

 */
