import com.mongodb.*;
// import com.mongodb.MongoClient;
// import com.mongodb.MongoException;
// import com.mongodb.WriteConcern;
// import com.mongodb.DB;
// import com.mongodb.DBObject;
import java.util.*;
import java.lang.*;
import java.io.File;
import java.io.IOException;
import org.apache.mahout.cf.taste.impl.similarity.*;
import org.apache.mahout.cf.taste.similarity.*;
//import org.apache.commons.cli2.OptionException;
import org.apache.mahout.cf.taste.common.TasteException;
//import uncommons-maths-1.2.3.*
//import org.apache.mahout.cf.taste.impl.recommender.*;
//import org.apache.mahout.cf.taste.impl.recommender.svd.ALSWRFactorizer;
import org.apache.mahout.cf.taste.impl.recommender.svd.*;
import org.apache.mahout.cf.taste.impl.model.mongodb.*;
public class recommandSystem{
	public static void main(String[] args) throws IOException, TasteException, MongoException {
		System.out.println("ab");
		//test();
	}
	public static void test() throws IOException, TasteException, MongoException {

		MongoClient mongoClient = new MongoClient( "localhost" , 27017 );
		DB db = mongoClient.getDB( "test" );
		DBCollection coll = db.getCollection("users");
		long u1 = 0;
		long u2 = 0;
		DBCursor cursor = coll.find(new BasicDBObject("name", "Bob"));
		try{
			if (cursor.hasNext()){
				//System.out.println(cursor.next());
				BasicDBObject obj = (BasicDBObject) cursor.next();
				u1 = obj.getLong("user_id");
			}
		} finally{
			cursor.close();
		}
		cursor = coll.find(new BasicDBObject("name", "Billy"));
		try{
			if (cursor.hasNext()){
				BasicDBObject obj = (BasicDBObject) cursor.next();
				u2 = obj.getLong("user_id");
			}
		} finally{
			cursor.close();
		}

		MongoDBDataModel dbm = 
   			new MongoDBDataModel("127.0.0.1", 27017, "test", "ratings", true, true, null);
		SVDRecommender svd = 
   			new SVDRecommender(dbm, new ALSWRFactorizer(dbm, 3, 0.05f, 50));
		LogLikelihoodSimilarity sim = new LogLikelihoodSimilarity(dbm);

		double score = 0;
		score = sim.userSimilarity(u1,u2);
		System.out.println(score);
	}
}