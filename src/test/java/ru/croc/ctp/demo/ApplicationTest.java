package ru.croc.ctp.demo;

import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.hasSize;
import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.json.JSONArray;
import org.json.JSONObject;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.test.context.web.WebAppConfiguration;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import java.util.UUID;

@RunWith(SpringRunner.class)
@WebAppConfiguration
@ContextConfiguration(classes = Application.class)
public class ApplicationTest {

    @Autowired
    private WebApplicationContext webApplicationContext;

    private MockMvc mockMvc;

    @Before
    public void init() {
        mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext).build();
    }

    @Test
    public void putAndGetTest() throws Exception {
        UUID uuid = UUID.randomUUID();

        String content = new JSONArray()
                .put(new JSONObject()
                        .put("__metadata", new JSONObject()
                                .put("type", "User")
                                .put("isNew",true))
                        .put("id",uuid.toString())
                        .put("firstName","firstUserName")
                        .put("lastName","lastUserName"))
                .toString();

        mockMvc.perform(post("/api/_store")
                .contentType(APPLICATION_JSON)
                .content(content))
                .andExpect(status().is2xxSuccessful());

        mockMvc.perform(get("/api/User(" + uuid + ")").accept(APPLICATION_JSON))
                .andExpect(jsonPath("result", hasSize(1)))
                .andExpect(jsonPath("result[0].id", equalTo(uuid.toString())))
                .andExpect(jsonPath("result[0].firstName", equalTo("firstUserName")))
                .andExpect(jsonPath("result[0].lastName", equalTo("lastUserName")));
    }
}
