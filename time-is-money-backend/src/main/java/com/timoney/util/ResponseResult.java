package com.timoney.util;

public class ResponseResult<T> {
    private int code;
    private String msg;
    private T data;

    public static <T> ResponseResult<T> success(T data) {
        ResponseResult<T> r = new ResponseResult<>();
        r.code = 200;
        r.msg = "ok";
        r.data = data;
        return r;
    }

    public static <T> ResponseResult<T> error(int code, String msg) {
        ResponseResult<T> r = new ResponseResult<>();
        r.code = code;
        r.msg = msg;
        return r;
    }

    public int getCode() { return code; }
    public void setCode(int code) { this.code = code; }
    public String getMsg() { return msg; }
    public void setMsg(String msg) { this.msg = msg; }
    public T getData() { return data; }
    public void setData(T data) { this.data = data; }
}
