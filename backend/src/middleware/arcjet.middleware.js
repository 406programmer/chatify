import aj from "../lib/arcjet.js";
import { isSpoofedBot } from "@arcjet/inspect";

export const arcjetProtection = async (req, res, next) => {
  try {
    const decision = await aj.protect(req);
    //check for denied access
    if (decision.isDenied()) {
        //check for rate limit
      if (decision.reason.isRateLimit()) {
        return res
          .status(429)
          .json({ message: "Rate limit exceeded. Please try again later." });
      } 
      //check for bot
      else if (decision.reason.isBot()) {
        return res.status(403).json({ message: "Bot access denied." });
      } else {
        
        return res
          .status(403)
          .json({ message: "Access denied by security policy." });
      }
    }

    //check for spoofed bots
    if (decision.results.some(isSpoofedBot)) {
      return res.status(403).json({error:"Spoofed bot detected", message: "Malicious bot activity detected." });
    }

    next();
  } catch (error) {
    console.error("Error in arcjetProtection middleware:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
