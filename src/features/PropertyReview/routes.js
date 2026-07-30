const express = require("express");
const controller = require("./controller");
const { authenticate } = require("../../middleware/authentication");
const { authorize } = require("../../middleware/rolemiddleware");

// Reviews belong to a listing, so they hang off the listing router and read
// :propertyId from it.
const propertyScoped = express.Router({ mergeParams: true });

propertyScoped.get("/", controller.listReviews);
propertyScoped.get("/summary", controller.summary);
propertyScoped.get("/eligibility", authenticate, controller.eligibility);
propertyScoped.post("/", authenticate, authorize(["seeker"]), controller.submitReview);
// A seeker holds one review slot per listing, so their own review needs no id.
propertyScoped.patch("/mine", authenticate, authorize(["seeker"]), controller.reviseReview);

// The seeker's cross-listing view: what they have written, and what they still
// owe before the window closes.
const seekerScoped = express.Router();

seekerScoped.use(authenticate);
seekerScoped.get("/mine", controller.myReviews);
seekerScoped.get("/pending", controller.pendingReviews);

module.exports = { propertyScoped, seekerScoped };
