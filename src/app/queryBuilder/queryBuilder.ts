import { FilterQuery, PopulateOptions, Query } from "mongoose";

type QueryParams = Record<string, unknown>;
type QueryConfig = {
  searchableFields?: string[];
  filterableFields?: string[];
  sortableFields?: string[];
  selectableFields?: string[];
};

class QueryBuilder<T> {
  public modelQuery: Query<T[], T>;
  public query: QueryParams;
  public config: QueryConfig;

  /**
   * @param modelQuery Model. like User, Student, Faculty
   * @param query req.query object
   * @param config each model's builder logic
   */
  constructor(
    modelQuery: Query<T[], T>,
    query: QueryParams,
    config: QueryConfig,
  ) {
    this.modelQuery = modelQuery;
    this.query = query;
    this.config = config;
  }

  /**
   *  ------------------- search -------------------
   *
   * @param searchableFields in which fields want to search. must passed array of fields to search
   * @returns return partial matching results
   */
  search() {
    const searchableFields: string[] = this.config.searchableFields || [];
    let search = this?.query?.search;
    if (search && typeof search === "string" && searchableFields.length) {
      const searchOptions = searchableFields.map(
        (field) =>
          ({
            [field]: { $regex: search, $options: "i" },
          }) as FilterQuery<T>,
      );
      this.modelQuery = this.modelQuery.find({
        $or: searchOptions,
      });
    }

    return this;
  }

  /**
   * ------------------- filter -------------------
   *
   * @returns exact matching. ex: email=mkmasudrana806@gmail.com.  except: ['search','sort', 'limit', 'page', 'fields'] these are query fields
   */
  filter() {
    const queryObj = { ...this.query };
    const filterableFields: string[] = this.config.filterableFields || [];
    const excludeFields = ["search", "sort", "limit", "page", "fields"];
    excludeFields.forEach((el) => delete queryObj[el]);

    // keep allowed filterable fields only
    const filter: QueryParams = {};
    for (const key in queryObj) {
      if (filterableFields.includes(key)) {
        filter[key] = queryObj[key];
      }
    }

    this.modelQuery = this.modelQuery.find(filter as FilterQuery<T>);
    return this;
  }

  /**
   * ------------------- sorting -------------------
   *
   * @returns sort based on any fields. ex: sort=email asc order. sort=-email desc order
   */
  sort() {
    const sortQuery = this.query?.sort;
    const sortableFields: string[] = this.config.sortableFields || [];
    if (typeof sortQuery === "string") {
      const fields = sortQuery.split(",");
      const validSortFields = fields
        .map((field) => field.trim())
        .filter((f) => {
          const cleanField = f.startsWith("-") ? f.substring(1) : f;
          return sortableFields.includes(cleanField);
        })
        .join(" ");

      this.modelQuery = this.modelQuery.sort(validSortFields || "-createdAt");
    } else {
      this.modelQuery = this.modelQuery.sort("-createdAt");
    }

    return this;
  }

  /**
   * ------------------- pagination -------------------
   *
   * @returns return paginated results. ex: ?page=1&limit=10. by default page=1, limit=10
   * maxium pagination allowed to 50.
   */
  paginate() {
    // ensure no abuse of limit
    const MAX_LIMIT = 50;
    let page = Number(this?.query?.page) || 1;
    let limit = Math.min(Number(this?.query?.limit) || 10, MAX_LIMIT);

    let skip = (page - 1) * limit;
    this.modelQuery = this.modelQuery.skip(skip).limit(limit);

    return this;
  }

  /**
   * ------------------- fields limiting -------------------
   *
   * @returns limit the fields. ex: fields=name,email keep these. fields=-name means except name, return alls fields
   */
  fieldsLimiting() {
    const fieldsQuery = this.query?.fields;
    const selectableFields: string[] = this.config.selectableFields || [];
    if (typeof fieldsQuery === "string") {
      const fields = fieldsQuery
        .split(",")
        .map((field) => field.trim())
        .filter((f) => {
          const cleanField = f.startsWith("-") ? f.substring(1) : f;
          return selectableFields.includes(cleanField);
        })
        .join(" ");

      this.modelQuery = this.modelQuery.select(fields || "-__v");
    } else {
      this.modelQuery = this.modelQuery.select("-__v");
    }

    return this;
  }

  /**
   * -------------- populate query result ------------------
   *
   * @param options populate object or array of objects ex: {path: "user", select: "name email"} or array of objects
   * @returns
   */
  populate(options: PopulateOptions | PopulateOptions[]) {
    this.modelQuery = this.modelQuery.populate(options);
    return this;
  }

  /**
   * -------------------  count documents -------------------------
   *
   * @param withDeleted by default false. ex: withDeletect=true, it counts deleted.
   * @returns page, limit, total counts and totalPage;
   */
  async countTotal(withDeleted: boolean = false) {
    const totalQueryries = this.modelQuery.getFilter(); // it gives previous filtered documents
    const total = await this.modelQuery.model
      .countDocuments(totalQueryries)
      .setOptions({ includeDeleted: withDeleted });

    const MAX_LIMIT = 50;
    let page = Number(this?.query?.page) || 1;
    let limit = Math.min(Number(this?.query?.limit) || 10, MAX_LIMIT);
    const totalPage = Math.ceil(total / limit);

    return {
      total,
      page,
      limit,
      totalPage,
    };
  }
}

export default QueryBuilder;
