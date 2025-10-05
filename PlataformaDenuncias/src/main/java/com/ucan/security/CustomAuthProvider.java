
package com.ucan.security;

/**
 *
 * @author cristiano
 *
package com.example.plataformadenuncias.security;

import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.stereotype.Component;

import java.util.Collections;

@Component
public class CustomAuthProvider implements AuthenticationProvider {

  @Override
  public Authentication authenticate(Authentication authentication) throws AuthenticationException {
    String username = authentication.getName();
    String password = authentication.getCredentials().toString();

    // Aqui você faria a validação do usuário (consultando banco, etc.)
    if ("admin".equals(username) && "123".equals(password)) {
      return new UsernamePasswordAuthenticationToken(username, password, Collections.emptyList());
    }

    return null;
  }

  @Override
  public boolean supports(Class<?> authentication) {
    return authentication.equals(UsernamePasswordAuthenticationToken.class);
  }
}

 */
