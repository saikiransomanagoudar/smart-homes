package com.smarthomes;

import java.io.Serializable;

public record User(String username, String email, String password) implements Serializable {
    private static final long serialVersionUID = 1L;
}
