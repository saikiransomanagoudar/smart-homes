package com.smarthomes;

import java.io.Serializable;

public record User(String name, String email, String password, String loginType) implements Serializable {
    private static final long serialVersionUID = 1L;
}
