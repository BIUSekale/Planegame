/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package ajax;

import java.io.IOException;
import java.io.PrintWriter;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.ResultSetMetaData;
import java.sql.SQLException;
import java.sql.Statement;
import java.text.DecimalFormat;
import java.util.ArrayList;
import java.util.List;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 *
 * @author 83505
 */
@WebServlet(name = "update", urlPatterns = {"/update"})
public class update extends HttpServlet {

    private static String dbURL = "jdbc:derby://localhost:1527/PlaneDB;"
            + "create=true;user=lql;password=123";
    private static String tableName = "userinfo";
    private static Connection conn = null;
    private static Statement stmt = null;

    private static void createConnection() {
        try {
            Class.forName("org.apache.derby.jdbc.ClientDriver").newInstance();
            //Get a connection
            conn = DriverManager.getConnection(dbURL);
        } catch (Exception except) {
            except.printStackTrace();
        }
    }

    private static void shutdown() {
        try {
            if (stmt != null) {
                stmt.close();
            }
            if (conn != null) {
                DriverManager.getConnection(dbURL + ";shutdown=true");
                conn.close();
            }
        } catch (SQLException sqlExcept) {
        }
    }

    public boolean ifExists(String colName, String colVal) {
        createConnection();
        boolean flag = false;
        try {
            stmt = conn.createStatement();
            ResultSet results = stmt.executeQuery("select * from " + tableName + " where " + colName + "='" + colVal + "'");
            if (results.next() != false) {
                results.close();
                flag = true;
            } else {
                flag = false;
            }
            stmt.close();
        } catch (SQLException sqlExcept) {
            sqlExcept.printStackTrace();
        }
        shutdown();
        return flag;
    }

    /**
     * Processes requests for both HTTP <code>GET</code> and <code>POST</code>
     * methods.
     *
     * @param request servlet request
     * @param response servlet response
     * @throws ServletException if a servlet-specific error occurs
     * @throws IOException if an I/O error occurs
     */
    protected void processRequest(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        response.setContentType("text/html;charset=UTF-8");
        try (PrintWriter out = response.getWriter()) {
            int record = 0;
            String username = request.getParameter("username");
            int score = Integer.parseInt(request.getParameter("score"));
//            out.println(username + score);
            if (ifExists("userid", username)) { //若用户已存在
                record = updateScore(username, score);
            } else {
                record = score;
                addUser(username, score);
            }
            out.println(record);
        } catch (Exception e) {

        }
    }

    // <editor-fold defaultstate="collapsed" desc="HttpServlet methods. Click on the + sign on the left to edit the code.">
    /**
     * Handles the HTTP <code>GET</code> method.
     *
     * @param request servlet request
     * @param response servlet response
     * @throws ServletException if a servlet-specific error occurs
     * @throws IOException if an I/O error occurs
     */
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        processRequest(request, response);
    }

    /**
     * Handles the HTTP <code>POST</code> method.
     *
     * @param request servlet request
     * @param response servlet response
     * @throws ServletException if a servlet-specific error occurs
     * @throws IOException if an I/O error occurs
     */
    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        processRequest(request, response);
    }

    /**
     * Returns a short description of the servlet.
     *
     * @return a String containing servlet description
     */
    @Override
    public String getServletInfo() {
        return "Short description";
    }// </editor-fold>

    private int updateScore(String username, int score) {
        createConnection();
        int record = 0;
        try {
            stmt = conn.createStatement();
            ResultSet results = stmt.executeQuery("select record from " + tableName + " where userid='" + username + "'");
            results.next();
            record = results.getInt(1);
            if (record < score) {
                record = score;
                stmt.executeUpdate("update " + tableName + " set record=" + score + " where userid='" + username + "'");
            }
            stmt.close();
        } catch (SQLException sqlExcept) {

        }
        shutdown();
        return record;
    }

    private String addUser(String username, int score) {
        createConnection();
        try {
            stmt = conn.createStatement();
            stmt.execute("insert into " + tableName + " values ('" + username + "'," + score + " )");
            stmt.close();
        } catch (SQLException sqlExcept) {
            return "2" + sqlExcept.getMessage();
        }
        shutdown();
        return "success2";
    }

}
