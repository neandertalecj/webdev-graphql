const graphql = require('graphql');

const { GraphQLObjectType, GraphQLString, GraphQLSchema, GraphQLID, GraphQLInt, GraphQLList, GraphQLNonNull } = graphql;
// GraphQLNonNull - маркерує обовязкові поля.

const Movies = require('../models/movie');
const Directors = require('../models/director');

/*
// All IDs set automatically by mLab
// Don't forget to update after creation
const directorsJson = [
  { "name": "Quentin Tarantino", "age": 55 }, //6093afd39bc14c34c2946723          
  { "name": "Michael Radford", "age": 72 }, //6093b4409bc14c34c2946725      
  { "name": "James McTeigue", "age": 51 }, //6093b4869bc14c34c2946726      
  { "name": "Guy Ritchie", "age": 50 }, //6093b4a49bc14c34c2946727    
];
// directorId - it is ID from the directors collection
const moviesJson = [
  { "name": "Pulp Fiction", "genre": "Crime", "directorId": "6093afd39bc14c34c2946723" },
  { "name": "1984", "genre": "Sci-Fi", "directorId": "6093b4409bc14c34c2946725" },
  { "name": "V for vendetta", "genre": "Sci-Fi-Triller", "directorId": "6093b4869bc14c34c2946726" },
  { "name": "Snatch", "genre": "Crime-Comedy", "directorId": "6093b4a49bc14c34c2946727" },
  { "name": "Reservoir Dogs", "genre": "Crime", "directorId": "6093afd39bc14c34c2946723" },
  { "name": "The Hateful Eight", "genre": "Crime", "directorId": "6093afd39bc14c34c2946723" },
  { "name": "Inglourious Basterds", "genre": "Crime", "directorId": "6093afd39bc14c34c2946723" },
  { "name": "Lock, Stock and Two Smoking Barrels", "genre": "Crime-Comedy", "directorId": "6093b4a49bc14c34c2946727" },
];
const movies = [
  { id: '1', name: "Pulp Fiction", genre: "Crime", directorId: "1" },
  { id: '2', name: "1984", genre: "Sci-Fi", directorId: "2" },
  { id: '3', name: "V for vendetta", genre: "Sci-Fi-Triller", directorId: "3" },
  { id: '4', name: "Snatch", genre: "Crime-Comedy", directorId: "4" },
  { id: '5', name: "Reservoir Dogs", genre: "Crime", directorId: "1" },
  { id: '6', name: "The Hateful Eight", genre: "Crime", directorId: "1" },
  { id: '7', name: "Inglourious Basterds", genre: "Crime", directorId: "1" },
  { id: '8', name: "Lock, Stock and Two Smoking Barrels", genre: "Crime-Comedy", directorId: "4" },
];
const directors = [
	{ id: '1', name: "Quentin Tarantino", age: 55 },
  { id: '2', name: "Michael Radford", age: 72 },
  { id: '3', name: "James McTeigue", age: 51 },
  { id: '4', name: "Guy Ritchie", age: 50 },
];
*/
// GraphQLObjectType - ожемо повністю опистаи схему даних, що зберігаються в базі за допомогою graphql
const MovieType = new GraphQLObjectType({
  name: 'Movie', // імя
  fields: () => ({ // обєкт даних обгорнутий у функцію
    id: { type: GraphQLID }, //кожному із властивостей задаємо тип
    name: { type: GraphQLString }, //типи експортуємо із graphql - просто string  не можемо написати
    genre: { type: GraphQLString },
    director: { //звязок між колекціями
			type: DirectorType, //це вже створений наими тип
			resolve(parent, args) {
				// return directors.find(director => director.id === parent.id); // id берем із парента
        return Directors.findById(parent.directorId);
      }
		}
  }),
});

const DirectorType = new GraphQLObjectType({
  name: 'Director',
  fields: () => ({
    id: { type: GraphQLID },
    name: { type: GraphQLString },
    age: { type: GraphQLInt },
    movies: { // список фільмів
			type: new GraphQLList(MovieType),
			resolve(parent, args) {
				// return movies.filter(movie => movie.directorId === parent.id);
        return Movies.find({ directorId: parent.id });
			},
		},
  }),
});


const Mutation = new GraphQLObjectType({
	name: 'Mutation',
	fields: {
		addDirector: {
			type: DirectorType,
			args: {
				name: { type: GraphQLString },
				age: { type: GraphQLInt },
			},
			resolve(parent, args) {
				const director = new Directors({
					name: args.name,
					age: args.age,
				});
				return director.save();
			},
		},
		addMovie: {
			type: MovieType,
			args: {
				name: { type: GraphQLString },
				genre: { type: GraphQLString },
				directorId: { type: GraphQLID },
			},
			resolve(parent, args) {
				const movie = new Movies({
					name: args.name,
					genre: args.genre,
					directorId: args.directorId,
				});
				return movie.save();
			},
		},
    deleteDirector: {
			type: DirectorType,
			args: { id: { type: GraphQLID } },
			resolve(parent, args) {
				return Directors.findByIdAndRemove(args.id);
			}
		},
		deleteMovie: {
			type: MovieType,
			args: { id: { type: GraphQLID } },
			resolve(parent, args) {
				return Movies.findByIdAndRemove(args.id);
			}
		},
		updateDirector: {
			type: DirectorType,
			args: {
				id: { type: GraphQLID },
				name: { type: new GraphQLNonNull(GraphQLString) },
				age: { type: new GraphQLNonNull(GraphQLInt) },
			},
			resolve(parent, args) {
				return Directors.findByIdAndUpdate(
					args.id,
					{ $set: { name: args.name, age: args.age } },
					{ new: true }, // у відповіді побачимоо обновлений обєкт
				);
			},
		},
		updateMovie: {
			type: MovieType,
			args: {
				id: { type: GraphQLID },
				name: { type: new GraphQLNonNull(GraphQLString) },
				genre: { type: new GraphQLNonNull(GraphQLString) },
				directorId: { type: GraphQLID },
			},
			resolve(parent, args) {
				return Movies.findByIdAndUpdate(
					args.id,
					{ $set: { name: args.name, genre: args.genre, directorId: args.directorId } },
					{ new: true },
				);
			},
		},
	}
});

// кореневий запрос - описуємо новий обєкт query
const Query = new GraphQLObjectType({
  name: 'Query',
  fields: {
    movie: {
      type: MovieType,
      args: { id: { type: GraphQLID } },
      resolve(parent, args) {
        // return movies.find(movie => movie.id == args.id);//=== - коли id було GraphQLString
        return Movies.findById(args.id);
      },
    },
    director: {
      type: DirectorType,
      args: { id: { type: GraphQLID } },
      resolve(parent, args) {
        // return directors.find(director => director.id === args.id);
        return Directors.findById(args.id);
      },
    },
    movies: {
			type: new GraphQLList(MovieType),
			resolve(parent, args) {
				// return movies;
        return Movies.find({});
			}
		},
		directors: {
			type: new GraphQLList(DirectorType),
			resolve(parent, args) {
				// return directors;
        return Directors.find({});
			}
		},
  }
});
//  { movie(id: "2") { id  name  genre }}    ///{ "data": {"movie": {"id": "2","name": "1984","genre": "Sci-Fi"}}}
 

// експортуємо кореневий запрос
module.exports = new GraphQLSchema({
  query: Query,
  mutation: Mutation,
});


