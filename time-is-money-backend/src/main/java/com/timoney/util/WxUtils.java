package com.timoney.util;

import cn.hutool.http.HttpUtil;
import cn.hutool.json.JSONObject;
import cn.hutool.json.JSONUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class WxUtils {

    private static final Logger log = LoggerFactory.getLogger(WxUtils.class);

    @Value("${wx.appid}")
    private String appid;

    @Value("${wx.secret}")
    private String secret;

    public String getOpenid(String code) {
        String url = "https://api.weixin.qq.com/sns/jscode2session?appid=" + appid
                + "&secret=" + secret
                + "&js_code=" + code
                + "&grant_type=authorization_code";
        String resp = HttpUtil.get(url);
        JSONObject json = JSONUtil.parseObj(resp);
        String openid = json.getStr("openid");
        if (openid == null) {
            log.error("微信登录失败: {}", resp);
            throw new RuntimeException("微信登录失败: " + json.getStr("errmsg"));
        }
        return openid;
    }
}
