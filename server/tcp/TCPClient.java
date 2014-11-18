import java.io.*;
import java.net.*;
class TCPClient
{
    public static void main(String argv[]) throws Exception
    {
        String sentence;
        String modifiedSentence;
        BufferedReader inFromUser = new BufferedReader( new InputStreamReader(System.in));
        Socket clientSocket = new Socket("localhost", 1337);
        DataOutputStream outToServer = new DataOutputStream(clientSocket.getOutputStream());
        BufferedReader inFromServer = new BufferedReader(new InputStreamReader(clientSocket.getInputStream()));
        sentence = inFromUser.readLine();
        outToServer.writeBytes(sentence + '\n');
        System.out.println("Done writing stream");
        
        //while(true) {
        	modifiedSentence = inFromServer.readLine();
        	System.out.println("FROM SERVER: " + modifiedSentence);
        	//if (modifiedSentence == "end") break;
    	//}

        clientSocket.close();
    }
}