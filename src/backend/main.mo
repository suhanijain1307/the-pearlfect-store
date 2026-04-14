import MixinObjectStorage "mo:caffeineai-object-storage/Mixin";
import Principal "mo:core/Principal";
import Text "mo:core/Text";
import Map "mo:core/Map";
import Iter "mo:core/Iter";
import Array "mo:core/Array";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import AccessControl "mo:caffeineai-authorization/access-control";
import MixinAuthorization "mo:caffeineai-authorization/MixinAuthorization";
import Storage "mo:caffeineai-object-storage/Storage";
import List "mo:core/List";



actor {
  // Mixins
  include MixinObjectStorage();

  // Types
  public type Product = {
    id : Text;
    name : Text;
    price : Float;
    salePrice : ?Float;
    saleEndDate : ?Int;
    description : Text;
    imageUrl : Storage.ExternalBlob;
    category : Text;
    inStock : Bool;
    createdAt : Int;
  };

  public type GalleryPhoto = {
    id : Text;
    imageUrl : Storage.ExternalBlob;
    caption : Text;
    createdAt : Int;
  };

  public type CustomOrderRequest = {
    id : Text;
    name : Text;
    contactNumber : Text;
    designDescription : Text;
    inspirationImageUrl : ?Storage.ExternalBlob;
    status : Text; // "pending" or "reviewed"
    createdAt : Int;
  };

  public type OrderItem = {
    productId : Text;
    productName : Text;
    quantity : Nat;
    price : Float;
  };

  public type Order = {
    id : Text;
    customerName : Text;
    phone : Text;
    address : Text;
    paymentMethod : Text; // "Razorpay" | "Cash on Delivery"
    items : [OrderItem];
    totalAmount : Float;
    status : Text; // "pending", "confirmed", "shipped", "out_for_delivery", "delivered", "cancelled"
    trackingNumber : ?Text;
    couponCode : ?Text;
    discountAmount : ?Float;
    razorpayPaymentId : ?Text;
    createdAt : Int;
  };

  public type Coupon = {
    id : Text;
    code : Text;
    discountPercent : Float;
    expiryDate : Int;
    usageLimit : Nat;
    usedCount : Nat;
    isActive : Bool;
  };

  public type PromoBanner = {
    text : Text;
    subText : Text;
    endDate : Int;
    isActive : Bool;
    bgColor : Text;
  };

  public type NewsletterSubscriber = {
    email : Text;
    subscribedAt : Int;
  };

  public type UserProfile = {
    name : Text;
  };

  public type ProductReview = {
    id : Text;
    productId : Text;
    reviewerName : Text;
    rating : Nat;
    comment : Text;
    createdAt : Int;
  };

  // Tracking update — one entry per status change or admin message
  public type TrackingEntry = {
    id : Text;
    trackingNumber : Text;
    status : Text; // "Processing" | "Shipped" | "Out for Delivery" | "Delivered"
    message : Text; // custom admin note (may be empty "")
    updatedAt : Int;
  };

  // State — all maps are stable (persist across upgrades)
  let productsMap = Map.empty<Text, Product>();
  let galleryPhotosMap = Map.empty<Text, GalleryPhoto>();
  let customOrderRequestsMap = Map.empty<Text, CustomOrderRequest>();
  let ordersMap = Map.empty<Text, Order>();
  let couponsMap = Map.empty<Text, Coupon>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  let newsletterSubscribers = Map.empty<Text, NewsletterSubscriber>();
  let reviewsMap = Map.empty<Text, ProductReview>();
  var promoBanner : ?PromoBanner = null;

  // trackingEntriesMap: trackingNumber -> ordered list of entries (history log)
  let trackingEntriesMap = Map.empty<Text, List.List<TrackingEntry>>();

  // Access Control
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // User Profile APIs
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Public APIs

  public query ({ caller }) func getProducts() : async [Product] {
    productsMap.values().toArray();
  };

  public query ({ caller }) func getProduct(id : Text) : async Product {
    switch (productsMap.get(id)) {
      case (?product) { product };
      case (null) { Runtime.trap("Product not found") };
    };
  };

  public query ({ caller }) func getGalleryPhotos() : async [GalleryPhoto] {
    galleryPhotosMap.values().toArray();
  };

  public shared ({ caller }) func submitCustomOrder(
    name : Text,
    contactNumber : Text,
    designDescription : Text,
    inspirationImageUrl : ?Storage.ExternalBlob,
  ) : async () {
    let id = Time.now().toText();
    let request : CustomOrderRequest = {
      id;
      name;
      contactNumber;
      designDescription;
      inspirationImageUrl;
      status = "pending";
      createdAt = Time.now();
    };
    customOrderRequestsMap.add(id, request);
  };

  // Place order — open to all callers (no auth required; admin auth is frontend-only)
  public shared ({ caller }) func placeOrder(
    customerName : Text,
    phone : Text,
    address : Text,
    paymentMethod : Text,
    items : [OrderItem],
    totalAmount : Float,
    couponCode : ?Text,
    discountAmount : ?Float,
    razorpayPaymentId : ?Text,
  ) : async () {
    let id = Time.now().toText();
    let order : Order = {
      id;
      customerName;
      phone;
      address;
      paymentMethod;
      items;
      totalAmount;
      status = "pending";
      trackingNumber = null;
      couponCode;
      discountAmount;
      razorpayPaymentId;
      createdAt = Time.now();
    };
    ordersMap.add(id, order);
  };

  public shared ({ caller }) func addReview(productId : Text, reviewerName : Text, rating : Nat, comment : Text) : async () {
    if (rating < 1 or rating > 5) { Runtime.trap("Rating must be between 1 and 5") };
    if (not productsMap.containsKey(productId)) { Runtime.trap("Product not found") };

    let id = Time.now().toText();
    let review : ProductReview = {
      id;
      productId;
      reviewerName;
      rating;
      comment;
      createdAt = Time.now();
    };
    reviewsMap.add(id, review);
  };

  public query ({ caller }) func getReviews(productId : Text) : async [ProductReview] {
    if (not productsMap.containsKey(productId)) { Runtime.trap("Product not found") };
    reviewsMap.values().toArray().filter(func(r) { r.productId == productId });
  };

  // Public order tracking by tracking number (no auth required)
  public query ({ caller }) func getOrderByTrackingNumber(trackingNumber : Text) : async ?Order {
    let matches = ordersMap.values().toArray().filter(
      func(o) {
        switch (o.trackingNumber) {
          case (?tn) { tn == trackingNumber };
          case (null) { false };
        };
      }
    );
    if (matches.size() == 0) { null } else { ?matches[0] };
  };

  // Public: get current tracking status + history for a tracking ID (customer-facing)
  public query ({ caller }) func getTrackingInfo(trackingNumber : Text) : async {
    currentStatus : ?Text;
    lastUpdatedAt : ?Int;
    history : [TrackingEntry];
  } {
    switch (trackingEntriesMap.get(trackingNumber)) {
      case (null) {
        { currentStatus = null; lastUpdatedAt = null; history = [] };
      };
      case (?entries) {
        let arr = entries.toArray();
        if (arr.size() == 0) {
          { currentStatus = null; lastUpdatedAt = null; history = [] };
        } else {
          let last = arr[arr.size() - 1];
          {
            currentStatus = ?last.status;
            lastUpdatedAt = ?last.updatedAt;
            history = arr;
          };
        };
      };
    };
  };

  // Coupon APIs
  public shared ({ caller }) func createCoupon(code : Text, discountPercent : Float, expiryDate : Int, usageLimit : Nat) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can create coupons");
    };

    if (discountPercent <= 0 or discountPercent > 100) {
      Runtime.trap("Discount percent must be between 1 and 100");
    };

    if (usageLimit == 0) {
      Runtime.trap("Usage limit must be greater than 0");
    };

    let id = expiryDate.toText();
    let coupon : Coupon = {
      id;
      code;
      discountPercent;
      expiryDate;
      usageLimit;
      usedCount = 0;
      isActive = true;
    };

    couponsMap.add(id, coupon);
  };

  public query ({ caller }) func getCoupons() : async [Coupon] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view coupons");
    };

    couponsMap.values().toArray();
  };

  public shared ({ caller }) func updateCoupon(couponId : Text, _request : Coupon) : async Coupon {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can update coupons");
    };

    switch (couponsMap.get(couponId)) {
      case (null) {
        Runtime.trap("Coupon not found");
      };
      case (?existingCoupon) {
        let updatedCoupon : Coupon = { existingCoupon with id = couponId };
        couponsMap.add(couponId, updatedCoupon);
        updatedCoupon;
      };
    };
  };

  public shared ({ caller }) func deleteCoupon(id : Text) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can delete coupons");
    };

    if (not couponsMap.containsKey(id)) {
      Runtime.trap("Coupon not found");
    };

    couponsMap.remove(id);
  };

  public shared ({ caller }) func applyCoupon(code : Text) : async Coupon {
    let matchingCoupons = couponsMap.values().toArray().filter(
      func(c) { c.code == code and c.isActive and c.expiryDate > Time.now() }
    );

    if (matchingCoupons.size() == 0) {
      Runtime.trap("Coupon not found or expired");
    };

    let coupon = matchingCoupons[0];

    if (coupon.usedCount >= coupon.usageLimit) {
      Runtime.trap("Coupon usage limit reached");
    };

    coupon;
  };

  // Newsletter & Promo APIs

  public shared ({ caller }) func subscribeNewsletter(email : Text) : async () {
    if (newsletterSubscribers.containsKey(email)) {
      Runtime.trap("Email already subscribed");
    };

    let subscriber : NewsletterSubscriber = {
      email;
      subscribedAt = Time.now();
    };

    newsletterSubscribers.add(email, subscriber);
  };

  public query ({ caller }) func getNewsletterSubscribers() : async [NewsletterSubscriber] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view subscribers");
    };
    newsletterSubscribers.values().toArray();
  };

  public shared ({ caller }) func setPromoBanner(text : Text, subText : Text, endDate : Int, bgColor : Text) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can set promo banner");
    };

    let banner : PromoBanner = {
      text;
      subText;
      endDate;
      isActive = true;
      bgColor;
    };

    promoBanner := ?banner;
  };

  public query ({ caller }) func getPromoBanner() : async ?{ text : Text; subText : Text; endDate : Int; bgColor : Text } {
    switch (promoBanner) {
      case (?banner) {
        if (banner.isActive and banner.endDate > Time.now()) {
          ?{
            text = banner.text;
            subText = banner.subText;
            endDate = banner.endDate;
            bgColor = banner.bgColor;
          };
        } else {
          null;
        };
      };
      case (null) { null };
    };
  };

  // Admin APIs

  // Admin product management
  public shared ({ caller }) func addProduct(
    name : Text,
    price : Float,
    salePrice : ?Float,
    saleEndDate : ?Int,
    description : Text,
    imageUrl : Storage.ExternalBlob,
    category : Text,
  ) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can add products");
    };

    let id = Time.now().toText();
    let product : Product = {
      id;
      name;
      price;
      salePrice;
      saleEndDate;
      description;
      imageUrl;
      category;
      inStock = true;
      createdAt = Time.now();
    };
    productsMap.add(id, product);
  };

  public shared ({ caller }) func updateProduct(
    id : Text,
    name : Text,
    price : Float,
    salePrice : ?Float,
    saleEndDate : ?Int,
    description : Text,
    imageUrl : Storage.ExternalBlob,
    category : Text,
    inStock : Bool,
  ) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can update products");
    };

    switch (productsMap.get(id)) {
      case (?existing) {
        let updatedProduct : Product = {
          id;
          name;
          price;
          salePrice;
          saleEndDate;
          description;
          imageUrl;
          category;
          inStock;
          createdAt = Time.now();
        };
        productsMap.add(id, updatedProduct);
      };
      case (null) { Runtime.trap("Product not found") };
    };
  };

  public shared ({ caller }) func deleteProduct(id : Text) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can delete products");
    };

    if (not productsMap.containsKey(id)) {
      Runtime.trap("Product not found");
    };

    productsMap.remove(id);
  };

  // Gallery and reviews admin APIs — admin auth handled in frontend
  public shared ({ caller }) func addGalleryPhoto(imageUrl : Storage.ExternalBlob, caption : Text) : async () {
    let id = Time.now().toText();
    let photo : GalleryPhoto = {
      id;
      imageUrl;
      caption;
      createdAt = Time.now();
    };
    galleryPhotosMap.add(id, photo);
  };

  public shared ({ caller }) func deleteGalleryPhoto(id : Text) : async () {
    if (not galleryPhotosMap.containsKey(id)) {
      Runtime.trap("Gallery photo not found");
    };

    galleryPhotosMap.remove(id);
  };

  public shared ({ caller }) func deleteReview(id : Text) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can delete reviews");
    };

    if (not reviewsMap.containsKey(id)) {
      Runtime.trap("Review not found");
    };

    reviewsMap.remove(id);
  };

  // Custom order management — open to all (admin auth handled in frontend)
  public query ({ caller }) func getCustomOrders() : async [CustomOrderRequest] {
    customOrderRequestsMap.values().toArray();
  };

  public shared ({ caller }) func updateCustomOrderStatus(id : Text, status : Text) : async () {
    switch (customOrderRequestsMap.get(id)) {
      case (?request) {
        let updatedRequest = { request with status };
        customOrderRequestsMap.add(id, updatedRequest);
      };
      case (null) { Runtime.trap("Custom order not found") };
    };
  };

  // Order management — open to all (admin auth handled in frontend)
  public query ({ caller }) func getOrders() : async [Order] {
    ordersMap.values().toArray();
  };

  // Admin: clear all orders and tracking entries (destructive — used before publishing)
  public shared ({ caller }) func clearAllOrders() : async () {
    ordersMap.clear();
    trackingEntriesMap.clear();
  };

  public query ({ caller }) func getOrderByPhone(phone : Text) : async [Order] {
    ordersMap.values().toArray().filter(func(o) { o.phone == phone });
  };

  public shared ({ caller }) func updateOrderStatus(id : Text, status : Text) : async () {
    switch (ordersMap.get(id)) {
      case (?order) {
        let updatedOrder = { order with status };
        ordersMap.add(id, updatedOrder);
      };
      case (null) { Runtime.trap("Order not found") };
    };
  };

  public shared ({ caller }) func updateOrderTracking(id : Text, trackingNumber : Text) : async () {
    switch (ordersMap.get(id)) {
      case (?order) {
        let updatedOrder = { order with trackingNumber = ?trackingNumber };
        ordersMap.add(id, updatedOrder);
      };
      case (null) { Runtime.trap("Order not found") };
    };
  };

  // ─── Tracking Status Management (admin-only) ────────────────────────────────

  // Update status for a tracking ID, appending an entry to the history log.
  // message may be "" if no custom note is needed.
  public shared ({ caller }) func updateTrackingStatus(
    trackingNumber : Text,
    status : Text,
    message : Text,
  ) : async TrackingEntry {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can update tracking status");
    };

    let entryId = Time.now().toText() # "-" # trackingNumber;
    let entry : TrackingEntry = {
      id = entryId;
      trackingNumber;
      status;
      message;
      updatedAt = Time.now();
    };

    let existing = switch (trackingEntriesMap.get(trackingNumber)) {
      case (?list) { list };
      case (null) { List.empty<TrackingEntry>() };
    };
    existing.add(entry);
    trackingEntriesMap.add(trackingNumber, existing);

    entry;
  };

  // Admin: retrieve the full history log for a tracking ID
  public query ({ caller }) func getTrackingHistory(trackingNumber : Text) : async [TrackingEntry] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view tracking history");
    };

    switch (trackingEntriesMap.get(trackingNumber)) {
      case (null) { [] };
      case (?list) { list.toArray() };
    };
  };

  public type TrackingSummary = {
    trackingNumber : Text;
    currentStatus : Text;
    lastMessage : Text;
    lastUpdatedAt : Int;
    totalEntries : Nat;
  };

  // Admin: get all tracking numbers that have at least one entry, with their latest status
  public query ({ caller }) func getAllTrackingSummaries() : async [TrackingSummary] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view tracking summaries");
    };

    let results = List.empty<TrackingSummary>();
    for ((tn, entries) in trackingEntriesMap.entries()) {
      let arr = entries.toArray();
      if (arr.size() > 0) {
        let last = arr[arr.size() - 1];
        results.add({
          trackingNumber = tn;
          currentStatus = last.status;
          lastMessage = last.message;
          lastUpdatedAt = last.updatedAt;
          totalEntries = arr.size();
        });
      };
    };
    results.toArray();
  };

  // Admin: edit a specific tracking entry's message (by entry id)
  public shared ({ caller }) func editTrackingEntry(
    trackingNumber : Text,
    entryId : Text,
    newMessage : Text,
  ) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can edit tracking entries");
    };

    switch (trackingEntriesMap.get(trackingNumber)) {
      case (null) { Runtime.trap("Tracking number not found") };
      case (?list) {
        list.mapInPlace(
          func(entry) {
            if (entry.id == entryId) { { entry with message = newMessage } } else {
              entry;
            };
          }
        );
        trackingEntriesMap.add(trackingNumber, list);
      };
    };
  };

  // Admin: delete a specific tracking entry by entry id
  public shared ({ caller }) func deleteTrackingEntry(
    trackingNumber : Text,
    entryId : Text,
  ) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can delete tracking entries");
    };

    switch (trackingEntriesMap.get(trackingNumber)) {
      case (null) { Runtime.trap("Tracking number not found") };
      case (?list) {
        let filtered = list.filter(func(entry) { entry.id != entryId });
        trackingEntriesMap.add(trackingNumber, filtered);
      };
    };
  };
};
